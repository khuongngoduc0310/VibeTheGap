import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkles, BarChart3, MessageSquare, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Hero Section */}
      <div className="px-6 py-24 sm:py-32 lg:px-8 bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center mb-8">
            <div className="rounded-full px-3 py-1 text-sm leading-6 text-indigo-600 ring-1 ring-indigo-600/10 hover:ring-indigo-600/20 bg-indigo-50/50">
              AI-Powered Student Feedback <Link href="/create" className="font-semibold text-indigo-600 ml-1"><span className="absolute inset-0" aria-hidden="true" />Read more &rarr;</Link>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Understand Your Campus Community with <span className="text-indigo-600">AI</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Stop guessing what your members want. Automatically generate smart feedback forms, 
            collect responses, and receive AI-driven insights in seconds.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/create">
              <Button size="lg" className="px-8 py-7 text-lg shadow-xl shadow-indigo-200">
                <Sparkles className="mr-2 h-5 w-5" /> Start for Free
              </Button>
            </Link>
            <Link href="#features" className="text-sm font-semibold leading-6 text-slate-900 group">
              Learn how it works <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 uppercase tracking-widest">Built for Speed</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Turn qualitative feedback into quantitative action.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  AI Form Generation
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">Just describe your event and goals. Our AI builds the perfect questions to get the data you actually need.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  One-Tap Sharing
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">Generate a unique link for every project. Mobile-friendly forms designed for high response rates.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  Automated Analysis
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">AI reads every word, extracts sentiment, identifies top pain points, and gives you actionable suggestions.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <p className="text-sm text-slate-500">
              © 2024 CampusPulse AI. Built for the next generation of campus leaders.
            </p>
        </div>
      </footer>
    </div>
  );
}
