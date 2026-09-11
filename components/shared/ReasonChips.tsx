import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ReasonChips({ reasons }: { reasons: string[] }) {
  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {reasons.map((reason) => (
        <Badge
          key={reason}
          variant="secondary"
          className="bg-accent/60 text-muted-foreground hover:text-foreground text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 border border-border/40 font-normal"
        >
          <Check className="w-3 h-3 text-emerald-400" />
          <span>{reason}</span>
        </Badge>
      ))}
    </div>
  );
}
