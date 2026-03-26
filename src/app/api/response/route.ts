import { prisma } from "@/lib/prisma";
import { submitResponseSchema } from "@/types";
import { errorResponse, successResponse } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submitResponseSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { formId, answers } = parsed.data;

    // Verify form exists and is published
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { id: true, published: true, projectId: true },
    });

    if (!form) {
      return errorResponse("Form not found", 404);
    }

    if (!form.published) {
      return errorResponse("This form is no longer accepting responses", 403);
    }

    // Save response
    const response = await prisma.response.create({
      data: {
        formId,
        answers,
      },
    });

    // Check if auto-analysis should trigger (every 10 responses)
    const responseCount = await prisma.response.count({
      where: { formId },
    });

    const shouldAutoAnalyze = responseCount % 10 === 0 && responseCount > 0;

    return successResponse(
      {
        id: response.id,
        responseNumber: responseCount,
        autoAnalysisTriggered: shouldAutoAnalyze,
      },
      201
    );
  } catch (error) {
    console.error("[POST /api/response]", error);
    return errorResponse("Failed to submit response", 500);
  }
}
