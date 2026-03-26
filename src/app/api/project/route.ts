import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/types";
import { auth, currentUser } from "@clerk/nextjs/server";
import { successResponse, errorResponse } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    const user = await currentUser();
    if (!user) return errorResponse("User not found", 404);

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return errorResponse("User email not found", 400);

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { organizationName, eventName, description, goal } = parsed.data;

    // Ensure user exists in our DB
    await prisma.user.upsert({
      where: { id: userId },
      update: { email, name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null },
      create: {
        id: userId,
        email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      },
    });

    const project = await prisma.project.create({
      data: {
        userId,
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
