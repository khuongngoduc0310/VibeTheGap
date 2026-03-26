import { prisma } from "@/lib/prisma";
import { generateFormSchema } from "@/types";
import { generateQuestions } from "@/lib/ai";
import { generateShareId, errorResponse, successResponse } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateFormSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { projectId } = parsed.data;

    // Fetch project details for AI context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { form: true },
    });

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // If form already exists, delete it (regeneration)
    if (project.form) {
      await prisma.form.delete({ where: { id: project.form.id } });
    }

    // Generate questions using AI
    const questions = await generateQuestions({
      organizationName: project.organizationName,
      eventName: project.eventName,
      description: project.description,
      goal: project.goal,
    });

    // Create form with questions in a transaction
    const form = await prisma.form.create({
      data: {
        projectId,
        shareId: generateShareId(),
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options,
            order: q.order,
          })),
        },
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    return successResponse(form, 201);
  } catch (error) {
    console.error("[POST /api/generate-form]", error);
    return errorResponse("Failed to generate form", 500);
  }
}
