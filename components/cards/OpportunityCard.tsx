import { Users, Code2, Tag, User, Sparkles, Heart } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { ReasonChips } from "@/components/shared/ReasonChips";

export interface OpportunityCardData {
  _id: string;
  title: string;
  description?: string;
  requiredSkills: string[];
  tags: string[];
  category?: string;
  teamSize?: number;
  interestedUsers?: any[];
  createdBy?: { _id?: string; name?: string; email?: string };
  score?: number;
  reasons?: string[];
}

export function OpportunityCard({
  opportunity,
  onViewDetails,
}: {
  opportunity: OpportunityCardData;
  onViewDetails: (opportunity: OpportunityCardData) => void;
}) {
  const interestedCount = opportunity.interestedUsers?.length || 0;

  return (
    <Card className="bg-card/60 border-border backdrop-blur-xl hover:border-purple-500/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-lg">
      <CardHeader className="p-5 pb-3 space-y-2">
        {/* Top Badges & Compatibility Score */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="px-2.5 py-0.5 border-purple-500/30 text-purple-400 bg-purple-950/20 text-xs font-semibold">
            {opportunity.category || "Project"}
          </Badge>

          {typeof opportunity.score === "number" && (
            <ScoreBadge score={opportunity.score} />
          )}
        </div>

        {/* Opportunity Title */}
        <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-purple-400 transition-colors leading-snug">
          {opportunity.title}
        </h3>

        {/* Reason Chips if available */}
        {opportunity.reasons && opportunity.reasons.length > 0 && (
          <div className="pt-1">
            <ReasonChips reasons={opportunity.reasons} />
          </div>
        )}
      </CardHeader>

      <CardContent className="px-5 py-2 space-y-3 text-xs text-muted-foreground">
        {/* Description snippet */}
        {opportunity.description && (
          <p className="line-clamp-2 leading-relaxed text-foreground/80">
            {opportunity.description}
          </p>
        )}

        {/* Required Skills Badges */}
        {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Required Skills:
            </span>
            <div className="flex flex-wrap gap-1">
              {opportunity.requiredSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-medium"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Metadata stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Team Size: <strong>{opportunity.teamSize || 1}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-pink-400 font-medium">
            <Heart className="w-3.5 h-3.5 fill-pink-400/20" />
            <span>{interestedCount} Interested</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-3">
        <Button
          onClick={() => onViewDetails(opportunity)}
          variant="outline"
          className="w-full rounded-xl text-xs font-semibold bg-background hover:bg-accent border-border"
        >
          View Details & Apply
        </Button>
      </CardFooter>
    </Card>
  );
}
