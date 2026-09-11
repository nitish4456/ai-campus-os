import { ReactNode } from "react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="p-8 md:p-12 rounded-3xl bg-card/40 border border-dashed border-border flex flex-col items-center justify-center text-center space-y-3">
      <div className="p-4 rounded-2xl bg-accent/50 text-muted-foreground">
        {icon || <SearchX className="w-8 h-8 text-muted-foreground" />}
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="font-semibold text-base text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button
            onClick={onAction}
            variant="outline"
            className="rounded-xl border-border bg-background hover:bg-accent text-xs"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
