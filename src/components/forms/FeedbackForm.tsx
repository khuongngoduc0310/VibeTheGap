"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label, Textarea } from "@/components/ui/FormPrimitives";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: "RATING" | "MULTIPLE_CHOICE" | "OPEN_ENDED";
  options: string[];
}

interface FeedbackFormProps {
  formId: string;
  organizationName: string;
  eventName: string;
  description: string;
  questions: Question[];
}

export function FeedbackForm({
  formId,
  organizationName,
  eventName,
  description,
  questions,
}: FeedbackFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    try {
      const res = await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId, answers: formattedAnswers }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to submit response");

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-xl mx-auto text-center py-12">
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Thank you!</CardTitle>
          <CardDescription className="text-lg">
            Your feedback for <strong>{eventName}</strong> has been submitted.
          </CardDescription>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            Submit Another Response
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">{eventName}</h1>
        <p className="text-slate-500 mt-2">{organizationName}</p>
        <p className="text-sm text-slate-400 italic mt-1">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((q) => (
          <Card key={q.id}>
            <CardHeader>
              <Label className="text-lg leading-tight">{q.text}</Label>
            </CardHeader>
            <CardContent>
              {q.type === "RATING" && (
                <div className="flex justify-between gap-2 max-w-sm mx-auto">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAnswer(q.id, val)}
                      className={`h-12 w-12 rounded-full border-2 transition-all font-bold ${
                        answers[q.id] === val
                          ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-md"
                          : "border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "MULTIPLE_CHOICE" && (
                <div className="space-y-3 font-medium">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        answers[q.id] === opt
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                          : "border-slate-100 hover:border-slate-200 text-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleAnswer(q.id, opt)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.type === "OPEN_ENDED" && (
                <Textarea
                  placeholder="Tell us your thoughts..."
                  className="min-h-[120px]"
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                />
              )}
            </CardContent>
          </Card>
        ))}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </form>
    </div>
  );
}
