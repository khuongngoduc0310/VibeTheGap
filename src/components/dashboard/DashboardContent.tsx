"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  BarChart3, 
  Copy, 
  ExternalLink, 
  Loader2, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  ThumbsDown, 
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  ArrowLeft,
  PieChart as PieChartIcon
} from "lucide-react";
import Link from "next/link";
import { QRCodeCard } from "./QRCodeCard";
import { motion, AnimatePresence } from "framer-motion";
import { StatisticDashboard } from "./StatisticDashboard";

interface Insight {
  id: string;
  summary: string;
  sentimentDistribution: any;
  painPoints: string[];
  suggestions: string[];
  responseCount: number;
  createdAt: Date;
}

interface QuestionStat {
  id: string;
  text: string;
  type: string;
  options: string[];
  order: number;
  counts: Record<string, number>;
}

interface DashboardContentProps {
  projectId: string;
  organizationName: string;
  eventName: string;
  formId: string;
  shareId: string;
  responseCount: number;
  initialInsight: Insight | null;
  stats: QuestionStat[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function DashboardContent({
  projectId,
  organizationName,
  eventName,
  formId,
  shareId,
  responseCount,
  initialInsight,
  stats,
}: DashboardContentProps) {
  const [insight, setInsight] = useState<Insight | null>(initialInsight);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"ai" | "stats">("ai");

  const shareUrl = `${window.location.origin}/form/${shareId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const json = await res.json();
      if (json.success) {
        setInsight(json.data);
      }
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="max-w-7xl mx-auto px-4 py-8 space-y-8"
    >
      {/* Header & Share Area */}
      <motion.div 
        variants={fadeInUp}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        <div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-indigo-600 mb-2 uppercase tracking-widest transition-colors mb-4 group"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{eventName}</h1>
          <p className="text-slate-500 font-medium">{organizationName} • Dashboard</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
          <div className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 group transition-all hover:border-indigo-300">
            <span className="text-sm text-slate-500 truncate max-w-[200px]">{shareUrl}</span>
            <button onClick={copyLink} className="p-1.5 hover:bg-white rounded transition-colors text-slate-400 hover:text-indigo-600">
              {copied ? <span className="text-xs font-bold text-green-600 uppercase">Copied!</span> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {responseCount > 0 ? (
            <Button 
              variant="outline" 
              className="w-full opacity-50 cursor-not-allowed" 
              onClick={(e) => e.preventDefault()} 
              title="Cannot edit form after receiving responses"
            >
              Edit Questions
            </Button>
          ) : (
            <Link href={`/form/${shareId}/edit`}>
              <Button variant="outline" className="w-full">
                Edit Questions
              </Button>
            </Link>
          )}
          <Link href={`/form/${shareId}`} target="_blank">
            <Button className="w-full shadow-md shadow-indigo-100">
              <ExternalLink className="mr-2 h-4 w-4" /> View Form
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="lg:col-span-1">
          <QRCodeCard url={shareUrl} />
        </div>
        
        <Card className="lg:col-span-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{responseCount}</div>
            <p className="text-xs text-slate-400 mt-1">Updates in real-time</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 overflow-hidden bg-indigo-600 text-white border-none shadow-lg shadow-indigo-100">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> AI Analysis Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-indigo-100 text-sm max-w-md">
              {insight 
                ? `Last analyzed at ${responseCount} responses. Get a fresh summary of your event feedback.`
                : "No analysis available yet. Collect some responses and trigger the AI to see insights."}
            </div>
            <Button 
              onClick={triggerAnalysis} 
              disabled={analyzing || responseCount === 0}
              variant="secondary"
              className="w-full sm:w-auto py-6 px-8 text-lg font-bold"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  {insight ? "Update Analysis" : "Generate Insights"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Area */}
      {insight && responseCount > 0 && (
        <motion.div 
          variants={fadeInUp}
          className="flex flex-wrap items-center gap-3 pt-6 pb-2"
        >
          <Button 
            variant={viewMode === "ai" ? "primary" : "outline"}
            onClick={() => setViewMode("ai")}
            className={`flex-1 sm:flex-none transition-all ${viewMode === "ai" ? "shadow-md shadow-indigo-200" : "text-slate-500 hover:text-indigo-600"}`}
          >
            <Sparkles className="mr-2 h-4 w-4" /> AI Insights
          </Button>
          <Button 
            variant={viewMode === "stats" ? "primary" : "outline"}
            onClick={() => setViewMode("stats")}
            className={`flex-1 sm:flex-none transition-all ${viewMode === "stats" ? "shadow-md shadow-indigo-200" : "text-slate-500 hover:text-indigo-600"}`}
          >
            <PieChartIcon className="mr-2 h-4 w-4" /> Detailed Statistics
          </Button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {insight && viewMode === "ai" && (
          <motion.div 
            key="insights"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Insights */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-indigo-100 shadow-sm">
                <CardHeader className="border-b border-indigo-50 bg-indigo-50/30">
                  <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <Mail className="h-5 w-5" /> Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-slate-700 leading-relaxed text-lg italic font-medium">
                    "{insight.summary}"
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-red-100 shadow-sm overflow-hidden">
                  <CardHeader className="bg-red-50/30 border-b border-red-50">
                    <CardTitle className="text-red-900 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5" /> Key Pain Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {insight.painPoints.map((point, i) => (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          key={i} 
                          className="flex items-start gap-3 p-3 bg-red-50 rounded-lg text-red-800 text-sm border border-red-100"
                        >
                          <span className="font-bold">{i+1}.</span> {point}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-green-100 shadow-sm overflow-hidden">
                  <CardHeader className="bg-green-50/30 border-b border-green-50">
                    <CardTitle className="text-green-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" /> Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {insight.suggestions.map((sug, i) => (
                        <motion.li 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          key={i} 
                          className="flex items-start gap-3 p-3 bg-green-50 rounded-lg text-green-800 text-sm border border-green-100"
                        >
                          <span className="font-bold">{i+1}.</span> {sug}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sentiment Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Sentiment Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: "Positive", value: insight.sentimentDistribution.positive, color: "bg-green-500", icon: ThumbsUp, textColor: "text-green-600" },
                    { label: "Neutral", value: insight.sentimentDistribution.neutral, color: "bg-amber-400", icon: Minus, textColor: "text-amber-600" },
                    { label: "Negative", value: insight.sentimentDistribution.negative, color: "bg-red-500", icon: ThumbsDown, textColor: "text-red-600" }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={`flex items-center gap-1.5 ${item.textColor} font-bold uppercase tracking-wide text-[11px]`}>
                          <item.icon className="h-4 w-4" /> {item.label}
                        </span>
                        <span className="font-black text-slate-700">{item.value}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, delay: 0.5 + idx * 0.2, ease: "circOut" }}
                          className={`${item.color} h-full transition-all`} 
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest text-center font-bold">
                    Based on {insight.responseCount} responses
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
        
        {insight && viewMode === "stats" && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <StatisticDashboard stats={stats} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State / Tips */}
      {!insight && responseCount > 0 && !analyzing && (
        <motion.div 
          variants={fadeInUp}
          className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <AlertCircle className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Analysis Ready</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">You have {responseCount} responses ready for analysis. Trigger the AI to unlock insights.</p>
          <Button variant="outline" className="px-10" onClick={triggerAnalysis}>
            Start AI Analysis
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

