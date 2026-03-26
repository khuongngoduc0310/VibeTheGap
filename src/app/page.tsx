"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkles, BarChart3, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";

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

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-white">
      {/* Hero Section */}
      <div className="px-6 py-24 sm:py-32 lg:px-8 bg-gradient-to-b from-indigo-50/50 to-white relative">
        <div className="absolute inset-0 bg-[url('https://tailwindui.com/img/beams-home@95.jpg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
        <motion.div 
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mx-auto max-w-2xl text-center relative z-10"
        >
          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <div className="rounded-full px-3 py-1 text-sm leading-6 text-indigo-600 ring-1 ring-indigo-600/10 hover:ring-indigo-600/20 bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:scale-105">
              AI-Powered Student Feedback <Link href="/create" className="font-semibold text-indigo-600 ml-1"><span className="absolute inset-0" aria-hidden="true" />Read more &rarr;</Link>
            </div>
          </motion.div>
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
          >
            Understand Your Campus Community with <span className="text-indigo-600">AI</span>
          </motion.h1>
          <motion.p 
            variants={fadeInUp}
            className="mt-6 text-lg leading-8 text-slate-600 font-medium"
          >
            Stop guessing what your members want. Automatically generate smart feedback forms, 
            collect responses, and receive AI-driven insights in seconds.
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link href="/create">
              <Button size="lg" className="px-8 py-7 text-lg shadow-xl shadow-indigo-200/50">
                <Sparkles className="mr-2 h-5 w-5" /> Start for Free
              </Button>
            </Link>
            <Link href="#features" className="text-sm font-semibold leading-6 text-slate-900 group">
              Learn how it works <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32 bg-white relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl lg:text-center"
          >
            <h2 className="text-base font-bold leading-7 text-indigo-600 uppercase tracking-[0.2em]">Built for Speed</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Turn qualitative feedback into quantitative action.
            </p>
          </motion.div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  title: "AI Form Generation",
                  desc: "Just describe your event and goals. Our AI builds the perfect questions to get the data you actually need.",
                  icon: Zap,
                  color: "bg-indigo-600"
                },
                {
                  title: "One-Tap Sharing",
                  desc: "Generate a unique link for every project. Mobile-friendly forms designed for high response rates.",
                  icon: MessageSquare,
                  color: "bg-indigo-600"
                },
                {
                  title: "Automated Analysis",
                  desc: "AI reads every word, extracts sentiment, identifies top pain points, and gives you actionable suggestions.",
                  icon: BarChart3,
                  color: "bg-indigo-600"
                }
              ].map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -10 }}
                  key={i} 
                  className="flex flex-col group p-8 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-100"
                >
                  <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-slate-900">
                    <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${feature.color} shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 italic">
                    <p className="flex-auto">"{feature.desc}"</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <p className="text-sm font-medium text-slate-400">
              © 2024 CampusPulse AI. Built for the next generation of campus leaders.
            </p>
        </div>
      </footer>
    </div>
  );
}

