import { prisma } from "@/lib/prisma";
import { updateQuestionsBatchSchema } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { errorResponse, successResponse } from "@/lib/utils";

// Batch update questions (saving text/options edits and reordering)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    const { shareId } = await params;
    const body = await request.json();
    const parsed = updateQuestionsBatchSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { questions } = parsed.data;

    // Verify form exists and user owns it (robust check for both shareId and internal ID)
    const form = await prisma.form.findFirst({
      where: {
        OR: [{ shareId }, { id: shareId }],
      },
      include: { project: true }
    });
    
    if (!form) return errorResponse("Form not found", 404);
    if (form.project.userId !== userId) return errorResponse("Unauthorized", 403);

    // Run a transaction to update all questions simultaneously
    await prisma.$transaction(
      questions.map((q) =>
        prisma.question.update({
          where: { id: q.id },
          data: {
            text: q.text,
            type: q.type as any,
            options: q.options,
            order: q.order,
          },
        })
      )
    );

    return successResponse({ updated: questions.length });
  } catch (error) {
    console.error("[PUT /api/form/[id]/questions]", error);
    return errorResponse("Failed to update questions", 500);
  }
}
