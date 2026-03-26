import { prisma } from "@/lib/prisma";
import { FeedbackForm } from "@/components/forms/FeedbackForm";
import { notFound } from "next/navigation";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const form = await prisma.form.findUnique({
    where: { shareId },
    include: {
      questions: { orderBy: { order: "asc" } },
      project: true,
    },
  });

  if (!form || !form.published) {
    return notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <FeedbackForm
        formId={form.id}
        organizationName={form.project.organizationName}
        eventName={form.project.eventName}
        description={form.project.description}
        questions={form.questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          type: q.type as any,
          options: q.options,
        }))}
      />
    </div>
  );
}
