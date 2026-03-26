import { prisma } from "@/lib/prisma";
import { EditFormClient } from "@/components/forms/EditFormClient";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { shareId } = await params;

  const form = await prisma.form.findUnique({
    where: { shareId },
    include: {
      project: true,
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!form) {
    return notFound();
  }

  if (form.project.userId !== userId) {
    return redirect("/");
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <EditFormClient
        formId={shareId}
        projectId={form.project.id}
        eventName={form.project.eventName}
        initialQuestions={form.questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          type: q.type as any,
          options: q.options,
          order: q.order,
          isCustom: q.isCustom,
        }))}
      />
    </div>
  );
}
