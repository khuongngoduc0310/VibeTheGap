import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { errorResponse, successResponse } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId },
      include: {
        form: {
          include: {
            questions: { orderBy: { order: "asc" } },
            responses: { orderBy: { createdAt: "desc" } }
          }
        },
        insights: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!project) return errorResponse("Project not found", 404);

    return successResponse(project);
  } catch (error) {
    console.error("[GET /api/project/[id]]", error);
    return errorResponse("Failed to fetch project details", 500);
  }
}
