import { safeCallback } from "./validation";

export const youtubeScope = "https://www.googleapis.com/auth/youtube.readonly";
export const youtubeAccountCookie = "frc-youtube-account";
export function hasYouTubeScope(scope: string | null | undefined) {
  return Boolean(scope?.split(/[\s,]+/).includes(youtubeScope));
}
export function socialDestination(value: unknown) {
  const path = safeCallback(value);
  return /^\/(api|auth|profile\/youtube)(\/|\?|$)/.test(path) ? "/dashboard" : path;
}
export function googleCallback(value: unknown) {
  return `/auth/complete?next=${encodeURIComponent(socialDestination(value))}`;
}
