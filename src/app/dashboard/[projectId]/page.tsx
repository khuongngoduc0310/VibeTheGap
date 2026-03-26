import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function ProjectDashboard({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId,
      userId: userId, // Ensure only the owner can access
    },
    include: {
      form: {
        select: {
          id: true,
          shareId: true,
          _count: {
            select: { responses: true },
          },
        },
      },
      insights: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!project) {
    return notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <DashboardContent
        projectId={project.id}
        organizationName={project.organizationName}
        eventName={project.eventName}
        formId={project.form?.id || ""}
        shareId={project.form?.shareId || ""}
        responseCount={project.form?._count.responses || 0}
        initialInsight={project.insights[0] || null}
      />
    </div>
  );
}
