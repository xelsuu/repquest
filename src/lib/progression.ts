export const TIER_NAMES = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond"] as const;
export const XP_PER_SUBTIER = 100;
export const SUBTIERS_BY_TIER = [3, 3, 3, 3, 4, 5] as const;

export type WorkoutProgressionData = {
  xp_awarded?: number | null;
  is_pr?: boolean | null;
};

export function workoutXp(workout: WorkoutProgressionData) {
  return typeof workout.xp_awarded === "number" ? workout.xp_awarded : 5 + (workout.is_pr ? 3 : 0);
}

export function progressionFromXp(totalXp: number) {
  const maxXp = SUBTIERS_BY_TIER.reduce((total, divisions) => total + divisions * XP_PER_SUBTIER, 0);
  const safeXp = Math.max(0, Math.min(totalXp, maxXp));
  let tierIndex = 0;
  let tierXp = safeXp;
  for (let index = 0; index < SUBTIERS_BY_TIER.length - 1; index += 1) {
    const tierSize = SUBTIERS_BY_TIER[index] * XP_PER_SUBTIER;
    if (tierXp < tierSize) break;
    tierXp -= tierSize;
    tierIndex += 1;
  }
  const divisionsInTier = SUBTIERS_BY_TIER[tierIndex];
  const tierSize = divisionsInTier * XP_PER_SUBTIER;
  const isMaxTier = tierIndex === TIER_NAMES.length - 1 && tierXp >= tierSize;
  const subTierXp = isMaxTier ? XP_PER_SUBTIER : tierXp % XP_PER_SUBTIER;
  const subTier = Math.min(Math.floor(tierXp / XP_PER_SUBTIER), divisionsInTier - 1);

  return { tier: TIER_NAMES[tierIndex], tierIndex, subTier: subTier + 1, subTierXp, progressPercent: Math.round((subTierXp / XP_PER_SUBTIER) * 100), xpToNext: isMaxTier ? 0 : XP_PER_SUBTIER - subTierXp, isMaxTier };
}

export function updateLoginStreak() {
  if (typeof window === "undefined") return 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  const lastLogin = window.localStorage.getItem("repquest-last-login");
  const savedStreak = Number(window.localStorage.getItem("repquest-login-streak") || "0");
  if (lastLogin === todayKey) return savedStreak || 1;
  const previous = lastLogin ? new Date(`${lastLogin}T00:00:00Z`) : null;
  const current = new Date(`${todayKey}T00:00:00Z`);
  const daysSinceLastLogin = previous ? Math.round((current.getTime() - previous.getTime()) / 86400000) : null;
  const nextStreak = daysSinceLastLogin === 1 ? savedStreak + 1 : 1;
  window.localStorage.setItem("repquest-last-login", todayKey);
  window.localStorage.setItem("repquest-login-streak", String(nextStreak));
  return nextStreak;
}

export function getLoginStreak() {
  return typeof window === "undefined" ? 0 : Number(window.localStorage.getItem("repquest-login-streak") || "0");
}
