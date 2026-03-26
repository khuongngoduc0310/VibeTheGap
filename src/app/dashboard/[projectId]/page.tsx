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
        include: {
          questions: { orderBy: { order: "asc" } },
          responses: true,
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

  const responseCount = project.form?.responses.length || 0;

  // Compute stats distribution per question
  const stats = project.form?.questions.map((q: any) => {
    const counts: Record<string, number> = {};
    if (q.type === "MULTIPLE_CHOICE" || q.type === "RATING") {
      project.form?.responses.forEach((res: any) => {
        const answers = res.answers as { questionId: string; value: string | number }[];
        if (Array.isArray(answers)) {
          const answer = answers.find((a) => a.questionId === q.id);
          if (answer) {
            const valStr = String(answer.value);
            counts[valStr] = (counts[valStr] || 0) + 1;
          }
        }
      });
    }
    return {
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
      order: q.order,
      counts,
    };
  }) || [];

  return (
    <div className="bg-slate-50 min-h-screen">
      <DashboardContent
        projectId={project.id}
        organizationName={project.organizationName}
        eventName={project.eventName}
        formId={project.form?.id || ""}
        shareId={project.form?.shareId || ""}
        responseCount={responseCount}
        initialInsight={project.insights[0] || null}
        stats={stats}
      />
    </div>
  );
}
