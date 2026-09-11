import { SignIn } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl pointer-events-none rounded-full" />

      <div className="z-10 w-full max-w-md flex flex-col items-center space-y-6">
        {/* UniNest Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome to UniNest
          </h1>
          <p className="text-sm text-indigo-300 font-medium">
            Your Intelligent Campus Platform
          </p>
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-[11px] text-indigo-300 font-semibold tracking-wider uppercase mt-1">
            Connect. Discover. Grow.
          </div>
        </div>

        {/* Clerk Sign In Card with Google OAuth */}
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full shadow-2xl',
              card: 'bg-slate-900/90 border border-slate-800 backdrop-blur-xl text-slate-100 rounded-3xl p-6 shadow-indigo-950/50',
              headerTitle: 'text-lg font-bold text-slate-100',
              headerSubtitle: 'text-xs text-slate-400',
              socialButtonsBlockButton:
                'bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 font-semibold rounded-xl transition-all',
              formButtonPrimary:
                'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25',
              footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-medium',
            },
          }}
        />
      </div>
    </main>
  );
}
