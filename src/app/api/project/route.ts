import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/types";
import { errorResponse, successResponse } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { email, name, organizationName, eventName, description, goal } =
      parsed.data;

    // Upsert user by email
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: name ?? undefined },
      create: { email, name },
    });

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        organizationName,
        eventName,
        description,
        goal,
      },
    });

    return successResponse(project, 201);
  } catch (error) {
    console.error("[POST /api/project]", error);
    return errorResponse("Failed to create project", 500);
  }
}
