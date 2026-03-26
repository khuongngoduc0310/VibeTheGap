"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/FormPrimitives";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      organizationName: formData.get("organizationName"),
      eventName: formData.get("eventName"),
      description: formData.get("description"),
      goal: formData.get("goal"),
    };

    try {
      // 1. Create Project
      const projectRes = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const projectJson = await projectRes.json();
      if (!projectJson.success) throw new Error(projectJson.error || "Failed to create project");

      const projectId = projectJson.data.id;

      // 2. Trigger AI Form Generation
      const generateRes = await fetch("/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const generateJson = await generateRes.json();
      if (!generateJson.success) throw new Error(generateJson.error || "Failed to generate form");

      // 3. Redirect to Dashboard
      router.push(`/dashboard/${projectId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl mx-auto"
      >
        <Card className="shadow-xl shadow-slate-200/50 border-slate-200/60 overflow-hidden bg-white/90 backdrop-blur-md">
          <div className="h-2 bg-indigo-600 w-full" />
          <CardHeader className="space-y-1 pb-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Create New Event</CardTitle>
            <CardDescription className="text-base text-slate-500">
              Tell us about your organization and event. Our AI will generate a tailored feedback form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="text-sm font-bold uppercase tracking-wider text-slate-500">Organization Name</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    placeholder="IEEE Student Branch"
                    className="py-6 bg-slate-50/50 border-slate-200 focus:bg-white transition-all underline-offset-4"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventName" className="text-sm font-bold uppercase tracking-wider text-slate-500">Event Name</Label>
                <Input
                  id="eventName"
                  name="eventName"
                  placeholder="Annual Tech Symposium 2026"
                  className="py-6 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-slate-500">Event Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="A 3-day conference focused on sustainable technology..."
                  className="min-h-[120px] bg-slate-50/50 border-slate-200 focus:bg-white transition-all leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal" className="text-sm font-bold uppercase tracking-wider text-slate-500">What is your primary goal for this feedback?</Label>
                <Input
                  id="goal"
                  name="goal"
                  placeholder="Evaluate workshop quality and speaker effectiveness"
                  className="py-6 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                  required
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" /> {/* Or AlertCircle if I want */}
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full py-7 text-lg font-bold shadow-lg shadow-indigo-100 mt-4 group"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Baking your form...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Generate Feedback Form
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
