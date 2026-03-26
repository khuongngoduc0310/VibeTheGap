"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

interface QuestionStat {
  id: string;
  text: string;
  type: string;
  options: string[];
  order: number;
  counts: Record<string, number>;
}

interface StatisticDashboardProps {
  stats: QuestionStat[];
}

const COLORS = ["#4f46e5", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4"];

export function StatisticDashboard({ stats }: StatisticDashboardProps) {
  // Sort by order so questions appear in the correct sequence
  const sortedStats = [...stats].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedStats.map((stat, idx) => {
          if (stat.type === "OPEN_ENDED") {
            return null; // Not showing open ended here, maybe a different view or just skipped
          }

          // Format data for Recharts
          const isRating = stat.type === "RATING";
          
          let data = [];
          
          if (isRating) {
            // Ratings usually 1-5
            data = [1, 2, 3, 4, 5].map(rating => ({
              name: String(rating),
              value: stat.counts[String(rating)] || 0,
            }));
          } else {
            // Multiple choice
            data = stat.options.map(opt => ({
              name: opt,
              value: stat.counts[opt] || 0,
            }));
          }

          return (
            <Card key={stat.id} className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-sm font-bold text-slate-800 leading-snug">
                  {stat.order}. {stat.text}
                </CardTitle>
              </CardHeader>
              <CardContent className={`pt-6 ${isRating ? 'h-[300px]' : 'h-[420px]'}`}>
                <ResponsiveContainer width="100%" height="100%">
                  {isRating ? (
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        wrapperStyle={{ paddingTop: "20px", fontSize: "12px", lineHeight: "1.5" }} 
                        iconType="circle" 
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {sortedStats.filter(s => s.type === "OPEN_ENDED").length > 0 && (
        <Card className="shadow-sm border-slate-100 mt-8">
           <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">Note</CardTitle>
           </CardHeader>
           <CardContent className="pt-6 text-sm text-slate-500">
             Open-ended questions are excluded from the statistical charts. Please refer to AI Insights for sentiment analysis and key pain points extracted from these qualitative responses.
           </CardContent>
        </Card>
      )}
    </div>
  );
}
