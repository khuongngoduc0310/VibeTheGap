import { prisma } from "@/lib/prisma";
import { analyzeSchema } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { analyzeFeedback } from "@/lib/ai";
import { sendSummaryEmail } from "@/lib/email";
import { errorResponse, successResponse } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { projectId } = parsed.data;

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId },
      include: {
        user: { select: { email: true } },
        form: {
          include: {
            questions: { orderBy: { order: "asc" } },
            responses: true,
          },
        },
      },
    });

    if (!project || !project.form) {
      return errorResponse("Project or form not found", 404);
    }

    if (project.form.responses.length === 0) {
      return errorResponse("No responses to analyze", 400);
    }

    // Run AI analysis
    const analysis = await analyzeFeedback({
      organizationName: project.organizationName,
      eventName: project.eventName,
      goal: project.goal,
      questions: project.form.questions.map((q: { text: string; type: string }) => ({
        text: q.text,
        type: q.type,
      })),
      responses: project.form.responses,
    });

    // Save insight
    const insight = await prisma.insight.create({
      data: {
        projectId,
        summary: analysis.summary,
        sentimentDistribution: analysis.sentimentDistribution,
        painPoints: analysis.painPoints,
        suggestions: analysis.suggestions,
        responseCount: project.form.responses.length,
      },
    });

    // Send email notification (non-blocking)
    sendSummaryEmail({
      to: project.user.email,
      organizationName: project.organizationName,
      eventName: project.eventName,
      summary: analysis.summary,
      responseCount: project.form.responses.length,
      painPoints: analysis.painPoints,
      suggestions: analysis.suggestions,
      sentimentDistribution: analysis.sentimentDistribution,
    }).catch((err) => console.error("[Email send failed]", err));

    return successResponse(insight, 201);
  } catch (error) {
    console.error("[POST /api/analyze]", error);
    return errorResponse("Failed to analyze feedback", 500);
  }
}
