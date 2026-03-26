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
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || null;
    
    try {
      await prisma.user.upsert({
        where: { id: userId },
        update: { email, name },
        create: {
          id: userId,
          email,
          name,
        },
      });
    } catch (e: any) {
      if (e.code === "P2002") {
        // If they recreated their Clerk account, they have a new userId but same email.
        // Delete the old dangling record to prevent unique constraint violations.
        await prisma.user.delete({ where: { email } });
        await prisma.user.create({
          data: {
            id: userId,
            email,
            name,
          }
        });
      } else {
        throw e;
      }
    }

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
