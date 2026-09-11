import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function ScoreBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  let badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

  if (score < 50) {
    badgeStyle = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
  } else if (score < 75) {
    badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-1 font-bold text-xs rounded-full border flex items-center gap-1.5 shadow-sm",
        badgeStyle,
        className
      )}
    >
      <Sparkles className="w-3 h-3" />
      <span>{score}% Match</span>
    </Badge>
  );
}
