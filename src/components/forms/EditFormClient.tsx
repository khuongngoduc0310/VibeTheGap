"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QuestionEditorCard, EditableQuestion } from "@/components/forms/QuestionEditorCard";
import { ArrowLeft, Loader2, Plus, Save } from "lucide-react";
import Link from "next/link";
import { nanoid } from "nanoid";

interface EditFormClientProps {
  formId: string;
  shareId: string;
  projectId: string;
  eventName: string;
  initialQuestions: EditableQuestion[];
}

export function EditFormClient({ formId, shareId, projectId, eventName, initialQuestions }: EditFormClientProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<EditableQuestion[]>(initialQuestions);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (updated: EditableQuestion) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  };

  const handleAddQuestion = () => {
    const newQ: EditableQuestion = {
      id: nanoid(), // Temporary ID until saved
      text: "",
      type: "OPEN_ENDED",
      options: [],
      order: questions.length + 1,
      isCustom: true,
      isNew: true,
    };
    setQuestions([...questions, newQ]);
  };

  const handleDelete = async (id: string) => {
    const qToDelete = questions.find(q => q.id === id);
    if (!qToDelete) return;

    // Remove from UI immediately
    setQuestions(questions.filter((q) => q.id !== id));

    // If it's saved in DB, delete it from API
    if (!qToDelete.isNew) {
      try {
        await fetch(`/api/question/${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // 1. Separate new vs existing questions
      const existingQs = questions.filter(q => !q.isNew).map((q, i) => ({ ...q, order: i + 1 }));
      const newQs = questions.filter(q => q.isNew).map((q, i) => ({ ...q, order: existingQs.length + i + 1 }));

      // 2. Batch update existing questions
      if (existingQs.length > 0) {
        const updateRes = await fetch(`/api/form/${shareId}/questions`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: existingQs }),
        });
        if (!updateRes.ok) throw new Error("Failed to update questions");
      }

      // 3. Create newly added questions individually
      for (const q of newQs) {
        const createRes = await fetch(`/api/form/${shareId}/question`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: q.text,
            type: q.type,
            options: q.options,
            order: q.order, // order was recalculated above
          }),
        });
        if (!createRes.ok) throw new Error("Failed to add new question");
      }

      // Reload to grab true DB IDs for the newly created ones
      router.refresh();
      
      // Navigate back to project dashboard
      router.push(`/dashboard/${projectId}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/dashboard/${projectId}`} className="text-sm text-slate-500 hover:text-indigo-600 flex items-center mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Edit Questions</h1>
          <p className="text-slate-500">Modify the AI-generated form for {eventName}</p>
        </div>
        
        <Button onClick={handleSave} disabled={saving} className="px-6 py-5 text-md font-bold shadow-lg shadow-indigo-100">
          {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          Save & Publish
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {questions.map((q, index) => (
          <QuestionEditorCard
            key={q.id}
            question={q}
            index={index}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}

        <div className="pt-4 pb-12 items-center flex justify-center">
          <Button variant="outline" onClick={handleAddQuestion} className="w-full py-6 border-dashed border-2 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700">
            <Plus className="mr-2 h-5 w-5" /> Add Custom Question
          </Button>
        </div>
      </div>
    </div>
  );
}
