"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calendar, MessageSquare, Copy, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: {
    id: string;
    eventName: string;
    organizationName: string;
    createdAt: string | Date;
    form?: {
      _count: {
        responses: number;
      };
    };
  };
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const router = useRouter();
  const [duplicating, setDuplicating] = useState(false);

  const duplicateProject = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (duplicating) return;

    setDuplicating(true);
    try {
      const res = await fetch(`/api/project/${project.id}/duplicate`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        router.refresh();
      } else {
        alert(json.error || "Failed to duplicate");
      }
    } catch (err) {
      console.error(err);
      alert("Error duplicating project");
    } finally {
      setDuplicating(false);
    }
  };

  const date = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Link href={`/dashboard/${project.id}`} className="block group h-full">
        <Card className="h-full border-slate-200/60 shadow-sm group-hover:shadow-xl group-hover:border-indigo-400/50 transition-all duration-300 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3 relative">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <ArrowRight className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                  {project.eventName}
                </CardTitle>
                <p className="text-sm font-medium text-slate-500 mt-1">{project.organizationName}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-semibold border border-indigo-100/50">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{project.form?._count.responses || 0} responses</span>
              </div>
              <Badge variant="outline" className="bg-slate-50/50 text-slate-500 border-slate-100 font-medium whitespace-nowrap">
                <Calendar className="h-3 w-3 mr-1" /> {date}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-end gap-2 px-6 pb-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50"
              onClick={duplicateProject}
              disabled={duplicating}
            >
              {duplicating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              Duplicate
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

