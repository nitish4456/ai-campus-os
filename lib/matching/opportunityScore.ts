import { IUser } from "@/models/User";
import { IOpportunity } from "@/models/Opportunity";

export interface OpportunityMatchResult {
  score: number; // 0 to 100
  reasons: string[];
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/[^\w]/g, "");
}

export function calculateOpportunityScore(
  user: Partial<IUser>,
  opportunity: Partial<IOpportunity>
): OpportunityMatchResult {
  const userSkills = (user.skills || []).map(normalizeTag);
  const userInterests = (user.interests || []).map(normalizeTag);
  const userProjects = (user.projects || []).map(normalizeTag);

  const reqSkills = (opportunity.requiredSkills || []).map(normalizeTag);
  const oppTags = (opportunity.tags || []).map(normalizeTag);
  const oppTitle = normalizeTag(opportunity.title || "");
  const oppDescription = normalizeTag(opportunity.description || "");

  const reasons: string[] = [];

  // 1. Skill Overlap (70% weight)
  const matchedReqSkills: string[] = [];
  if (reqSkills.length > 0 && userSkills.length > 0) {
    opportunity.requiredSkills?.forEach((origSkill) => {
      const norm = normalizeTag(origSkill);
      if (userSkills.some((us) => us === norm || us.includes(norm) || norm.includes(us))) {
        matchedReqSkills.push(origSkill);
      }
    });
  }

  let skillOverlap = 0;
  if (reqSkills.length > 0) {
    skillOverlap = matchedReqSkills.length / reqSkills.length;
    matchedReqSkills.forEach((skill) => {
      reasons.push(`${skill} matches required skill`);
    });
  } else {
    skillOverlap = 1.0;
  }

  // 2. Interest Overlap (20% weight)
  const matchedInterests: string[] = [];
  if (userInterests.length > 0 && oppTags.length > 0) {
    user.interests?.forEach((origInterest) => {
      const norm = normalizeTag(origInterest);
      if (oppTags.some((ot) => ot === norm || ot.includes(norm) || norm.includes(ot))) {
        matchedInterests.push(origInterest);
      }
    });
  }

  let interestOverlap = 0;
  if (matchedInterests.length > 0) {
    const denom = Math.min(oppTags.length, Math.max(1, userInterests.length));
    interestOverlap = Math.min(1.0, matchedInterests.length / denom);
    reasons.push(`Interest in ${matchedInterests[0]}`);
  }

  // 3. Project Relevance (10% weight)
  let projectRelevance = 0;
  if (userProjects.length > 0) {
    const hasRelevantProject = userProjects.some(
      (proj) =>
        (proj.length > 2 && oppTitle.includes(proj)) ||
        (proj.length > 2 && oppDescription.includes(proj)) ||
        oppTags.some((ot) => ot.includes(proj) || proj.includes(ot))
    );

    if (hasRelevantProject) {
      projectRelevance = 1.0;
      reasons.push("Relevant previous project");
    }
  }

  // Calculate Weighted Score: (skillOverlap * 0.70) + (interestOverlap * 0.20) + (projectRelevance * 0.10)
  const totalScore =
    skillOverlap * 0.70 +
    interestOverlap * 0.20 +
    projectRelevance * 0.10;

  const percentageScore = Math.round(totalScore * 100);

  return {
    score: percentageScore,
    reasons,
  };
}
