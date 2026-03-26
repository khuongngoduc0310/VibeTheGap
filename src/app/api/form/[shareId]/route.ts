import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/utils";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    const form = await prisma.form.findUnique({
      where: { shareId },
      include: {
        questions: { orderBy: { order: "asc" } },
        project: {
          select: {
            organizationName: true,
            eventName: true,
            description: true,
          },
        },
      },
    });

    if (!form) {
      return errorResponse("Form not found", 404);
    }

    if (!form.published) {
      return errorResponse("This form is no longer accepting responses", 403);
    }

    return successResponse(form);
  } catch (error) {
    console.error("[GET /api/form/[shareId]]", error);
    return errorResponse("Failed to fetch form", 500);
  }
}
