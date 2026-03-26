import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { errorResponse, successResponse } from "@/lib/utils";

// Delete a specific question
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    const { id: questionId } = await params;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        form: {
          include: { project: true }
        }
      }
    });

    if (!question) {
      return errorResponse("Question not found", 404);
    }

    if (question.form.project.userId !== userId) {
      return errorResponse("Unauthorized", 403);
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/question/[id]]", error);
    return errorResponse("Failed to delete question", 500);
  }
}
