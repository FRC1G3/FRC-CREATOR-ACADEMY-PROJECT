import { hash, compare } from "bcryptjs";
export const hashPassword = (password: string) => {
  if (new TextEncoder().encode(password).length > 72) throw new Error("Password exceeds bcrypt byte limit.");
  return hash(password, 12);
};
export const verifyPassword = ({ hash: stored, password }: { hash: string; password: string }) => compare(password, stored);
