"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <nav className="border-b bg-white border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <Link href="/" className="font-bold text-xl text-slate-900 tracking-tight">
              CampusPulse <span className="text-indigo-600">AI</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {!isLoaded ? (
              <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
            ) : isSignedIn ? (
              <>
                <Link href="/create" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                  New Event
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">Sign In</Button>
                </SignInButton>
                <Link href="/sign-up">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
