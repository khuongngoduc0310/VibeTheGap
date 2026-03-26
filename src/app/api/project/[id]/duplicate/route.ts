import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { errorResponse, successResponse } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    const { id } = await params;

    // 1. Fetch original project, form, and questions
    const original = await prisma.project.findUnique({
      where: { id, userId },
      include: {
        form: {
          include: { questions: true }
        }
      }
    });

    if (!original) return errorResponse("Project not found", 404);

    // 2. Clone project
    const duplicated = await prisma.project.create({
      data: {
        userId,
        organizationName: original.organizationName,
        eventName: `${original.eventName} (Copy)`,
        description: original.description,
        goal: original.goal,
        form: {
          create: {
            published: true, // New copy is published by default
            questions: {
              create: original.form?.questions.map((q: any) => ({
                text: q.text,
                type: q.type,
                options: q.options || undefined,
                order: q.order,
                isCustom: q.isCustom
              }))
            }
          }
        }
      }
    });

    return successResponse(duplicated, 201);
  } catch (error) {
    console.error("[POST /api/project/[id]/duplicate]", error);
    return errorResponse("Failed to duplicate project", 500);
  }
}
