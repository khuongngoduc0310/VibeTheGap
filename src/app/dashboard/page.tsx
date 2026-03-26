import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Layout } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      form: {
        select: {
          _count: {
            select: { responses: true }
          }
        }
      }
    }
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Projects</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage all your AI feedback forms and insights.</p>
          </div>
          <Link href="/create">
            <Button className="shadow-lg shadow-indigo-100 py-6 px-8 text-lg font-bold">
              <Plus className="mr-2 h-5 w-5" /> New Project
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Layout className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Create your first AI-powered feedback project to start gathering insights from your audience.
            </p>
            <Link href="/create">
              <Button size="lg" className="px-10">Get Started</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: any, index: number) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
