import { IUser } from "@/models/User";
import { IEvent } from "@/models/Event";

export interface EventMatchResult {
  score: number; // 0 to 100
  reasons: string[];
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/[^\w]/g, "");
}

export function calculateEventScore(
  user: Partial<IUser>,
  event: Partial<IEvent>
): EventMatchResult {
  const userInterests = (user.interests || []).map(normalizeTag);
  const userSkills = (user.skills || []).map(normalizeTag);
  const eventTags = (event.tags || []).map(normalizeTag);
  const eventCategory = (event.category || "").trim().toLowerCase();

  const reasons: string[] = [];

  // 1. Interest Overlap (50% weight)
  const matchedInterests: string[] = [];
  if (userInterests.length > 0 && eventTags.length > 0) {
    user.interests?.forEach((origInterest) => {
      const norm = normalizeTag(origInterest);
      if (eventTags.some((et) => et === norm || et.includes(norm) || norm.includes(et))) {
        matchedInterests.push(origInterest);
      }
    });
  }

  let interestOverlap = 0;
  if (matchedInterests.length > 0) {
    // If 1 or more user interests match the event tags, interest match is strong (0.8 - 1.0)
    interestOverlap = Math.min(1.0, 0.7 + matchedInterests.length * 0.3);
    reasons.push(`Matches your interest in ${matchedInterests[0]}`);
  }

  // 2. Skill Tag Overlap (30% weight)
  const matchedSkills: string[] = [];
  if (userSkills.length > 0 && eventTags.length > 0) {
    user.skills?.forEach((origSkill) => {
      const norm = normalizeTag(origSkill);
      if (eventTags.some((et) => et === norm || et.includes(norm) || norm.includes(et))) {
        matchedSkills.push(origSkill);
      }
    });
  }

  let skillTagOverlap = 0;
  if (matchedSkills.length > 0) {
    // If 1 or more user skills match the event tags, skill match is strong (0.8 - 1.0)
    skillTagOverlap = Math.min(1.0, 0.7 + matchedSkills.length * 0.3);
    reasons.push(`Matches your ${matchedSkills[0]} skill`);
  }

  // 3. Category Match (20% weight)
  let categoryMatch = 0;
  if (eventCategory) {
    const matchesUserInterestCat = userInterests.some(
      (ui) => ui.includes(eventCategory) || eventCategory.includes(ui)
    );
    const matchesUserSkillCat = userSkills.some(
      (us) => us.includes(eventCategory) || eventCategory.includes(us)
    );

    if (
      matchesUserInterestCat ||
      matchesUserSkillCat ||
      eventCategory === "technology" ||
      eventCategory === "workshop" ||
      eventCategory === "hackathon"
    ) {
      categoryMatch = 1.0;
      reasons.push(`Relevant to your preferred category (${event.category})`);
    }
  }

  // Calculate Weighted Score: (interestOverlap * 0.50) + (skillTagOverlap * 0.30) + (categoryMatch * 0.20)
  const totalScore =
    interestOverlap * 0.50 +
    skillTagOverlap * 0.30 +
    categoryMatch * 0.20;

  const percentageScore = Math.round(totalScore * 100);

  return {
    score: percentageScore,
    reasons,
  };
}
