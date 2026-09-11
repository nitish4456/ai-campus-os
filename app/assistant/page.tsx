import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { AIChat } from "@/components/chat/AIChat";
import { Bot, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default async function AssistantPage() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header userName={dbUser.name} />

        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-0.5 border-indigo-500/40 text-indigo-400 bg-indigo-950/30">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Gemini AI Powered
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Friday
              </h1>
              <p className="text-muted-foreground text-sm">
                Your intelligent campus assistant for UniNest.
              </p>
            </div>
          </div>

          {/* AI Chat Interface */}
          <AIChat />
        </main>
      </div>
    </div>
  );
}
