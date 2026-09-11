import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Sparkles, ArrowRight, Bot, Calendar, Search, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default async function LandingPage() {
  const { userId } = await auth();
  const ctaHref = userId ? "/dashboard" : "/sign-in";
  const ctaLabel = userId ? "Go to Dashboard" : "Sign In to UniNest";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-pink-600/20 blur-3xl pointer-events-none rounded-full" />

      {/* Top Navbar */}
      <nav className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 pb-8 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">
            UniNest
          </span>
        </div>

        <Link href={ctaHref}>
          <Button variant="outline" className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-100 font-medium rounded-xl">
            {ctaLabel}
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl w-full mx-auto text-center space-y-8 z-10 py-16">
        <Badge variant="outline" className="px-4 py-1.5 border-indigo-500/40 text-indigo-400 bg-indigo-950/40 backdrop-blur-md rounded-full text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 mr-2 inline-block text-indigo-400" />
          Next-Gen Intelligent Campus Platform
        </Badge>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-300 leading-tight">
          UniNest
        </h1>

        <p className="text-slate-300 text-lg sm:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
          Your Intelligent Campus Platform.
        </p>

        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Automated lost & found matching, skill-based team finder, personalized event recommendations, and Friday — your AI assistant.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href={ctaHref}>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 rounded-2xl font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center gap-2 group">
              <span>{ctaLabel}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
            <Search className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-sm text-slate-200">Lost & Found AI</h3>
            <p className="text-xs text-slate-400">Intelligent image & text matching for lost items.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-sm text-slate-200">Skill Connect</h3>
            <p className="text-xs text-slate-400">Find teammates for hackathons and projects.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
            <Calendar className="w-5 h-5 text-pink-400" />
            <h3 className="font-semibold text-sm text-slate-200">Smart Events</h3>
            <p className="text-xs text-slate-400">Personalized event feed matched to your interests.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-sm text-slate-200">Friday</h3>
            <p className="text-xs text-slate-400">24/7 campus AI assistant powered by Gemini.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 z-10">
        <p>© 2026 UniNest. Built for students.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <a
            href="https://github.com/nitish4456/ai-campus-os"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View AI Campus OS on GitHub"
            className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
          >
            <GithubIcon className="w-4 h-4 text-indigo-400" />
            <span>GitHub Repository</span>
          </a>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Secure Clerk Auth</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
