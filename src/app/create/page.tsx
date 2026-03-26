"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/FormPrimitives";
import { Loader2, Sparkles } from "lucide-react";

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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Tell us about your organization and event. Our AI will generate a tailored feedback form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  placeholder="IEEE Student Branch"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                name="eventName"
                placeholder="Annual Hackathon 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A 24-hour hackathon for beginners with workshops and mentorship..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Goal of Feedback</Label>
              <Input
                id="goal"
                name="goal"
                placeholder="Improve workshop quality and mentor engagement"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-6" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating AI Form...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Project & Generate Form
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
