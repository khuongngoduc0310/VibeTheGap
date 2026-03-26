import { prisma } from "@/lib/prisma";
import { addQuestionSchema } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { errorResponse, successResponse } from "@/lib/utils";

// Add a single custom question to the form
export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    const { shareId } = await params;
    const body = await request.json();
    const parsed = addQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { text, type, options, order } = parsed.data;

    const form = await prisma.form.findUnique({
      where: { shareId },
      include: { project: true }
    });
    
    if (!form) return errorResponse("Form not found", 404);
    if (form.project.userId !== userId) return errorResponse("Unauthorized", 403);

    const question = await prisma.question.create({
      data: {
        formId: form.id,
        text,
        type: type as any,
        options,
        order,
        isCustom: true,
      },
    });

    return successResponse(question, 201);
  } catch (error) {
    console.error("[POST /api/form/[id]/question]", error);
    return errorResponse("Failed to add question", 500);
  }
}
