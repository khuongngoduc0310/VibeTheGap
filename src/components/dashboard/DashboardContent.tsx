"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
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
  Minus
} from "lucide-react";
import Link from "next/link";

interface Insight {
  id: string;
  summary: string;
  sentimentDistribution: any;
  painPoints: string[];
  suggestions: string[];
  responseCount: number;
  createdAt: Date;
}

interface DashboardContentProps {
  projectId: string;
  organizationName: string;
  eventName: string;
  formId: string;
  shareId: string;
  responseCount: number;
  initialInsight: Insight | null;
}

export function DashboardContent({
  projectId,
  organizationName,
  eventName,
  formId,
  shareId,
  responseCount,
  initialInsight,
}: DashboardContentProps) {
  const [insight, setInsight] = useState<Insight | null>(initialInsight);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Share Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{eventName}</h1>
          <p className="text-slate-500">{organizationName} • Dashboard</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
          <div className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 group">
            <span className="text-sm text-slate-500 truncate max-w-[200px]">{shareUrl}</span>
            <button onClick={copyLink} className="p-1.5 hover:bg-white rounded transition-colors text-slate-400 hover:text-indigo-600">
              {copied ? <span className="text-xs font-bold text-green-600 uppercase">Copied!</span> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <Link href={`/form/${shareId}/edit`}>
            <Button variant="outline" className="w-full">
              Edit Questions
            </Button>
          </Link>
          <Link href={`/form/${shareId}`} target="_blank">
            <Button className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" /> View Form
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{responseCount}</div>
            <p className="text-xs text-slate-400 mt-1">Updates in real-time</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 overflow-hidden bg-indigo-600 text-white border-none">
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
              className="w-full sm:w-auto py-6 px-8 text-lg"
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
      </div>

      {/* Detail Area */}
      {insight && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Insights */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-indigo-100">
              <CardHeader className="border-b border-indigo-50">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Mail className="h-5 w-5" /> Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-700 leading-relaxed text-lg italic">
                  "{insight.summary}"
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-red-100">
                <CardHeader>
                  <CardTitle className="text-red-900 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" /> Key Pain Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {insight.painPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg text-red-800 text-sm border border-red-100">
                        <span className="font-bold">{i+1}.</span> {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-100">
                <CardHeader>
                  <CardTitle className="text-green-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {insight.suggestions.map((sug, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg text-green-800 text-sm border border-green-100">
                        <span className="font-bold">{i+1}.</span> {sug}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sentiment Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-green-600 font-medium">
                      <ThumbsUp className="h-4 w-4" /> Positive
                    </span>
                    <span className="font-bold">{insight.sentimentDistribution.positive}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${insight.sentimentDistribution.positive}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                      <Minus className="h-4 w-4" /> Neutral
                    </span>
                    <span className="font-bold">{insight.sentimentDistribution.neutral}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-amber-400 h-full transition-all duration-1000" style={{ width: `${insight.sentimentDistribution.neutral}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-red-600 font-medium">
                      <ThumbsDown className="h-4 w-4" /> Negative
                    </span>
                    <span className="font-bold">{insight.sentimentDistribution.negative}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${insight.sentimentDistribution.negative}%` }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest text-center">
                  Based on {insight.responseCount} responses
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State / Tips */}
      {!insight && responseCount > 0 && !analyzing && (
        <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-500 mb-4">You have {responseCount} responses ready for analysis.</p>
          <Button variant="secondary" onClick={triggerAnalysis}>
            Start AI Analysis
          </Button>
        </div>
      )}
    </div>
  );
}
