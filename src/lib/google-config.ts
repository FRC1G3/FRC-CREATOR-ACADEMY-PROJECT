import "server-only";

export function googleAvailable() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}
export function googleProviders() {
  return googleAvailable() ? { google: {
    clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    accessType: "online" as const, includeGrantedScopes: false, overrideUserInfoOnSignIn: false,
  } } : {};
}
