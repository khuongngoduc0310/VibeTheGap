import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { errorResponse, successResponse } from "@/lib/utils";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        form: {
          select: {
            _count: {
              select: { responses: true }
            }
          }
        }
      }
    });

    return successResponse(projects);
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return errorResponse("Failed to fetch projects", 500);
  }
}
