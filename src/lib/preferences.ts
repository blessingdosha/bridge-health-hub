const AI_KEY = "medbridge_ai_recommendations";

export function getAiRecommendationsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(AI_KEY);
  if (v === null) return true;
  return v === "true";
}

export function setAiRecommendationsEnabled(on: boolean): void {
  localStorage.setItem(AI_KEY, on ? "true" : "false");
  window.dispatchEvent(new Event("medbridge-prefs"));
}
