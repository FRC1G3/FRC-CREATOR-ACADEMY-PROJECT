import { expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/password";
it("hashes passwords with salt and verifies correct credentials only", async () => {
  const password = "test-only-password";
  const stored = await hashPassword(password);
  expect(stored).not.toBe(password);
  expect(stored).toMatch(/^\$2[aby]\$12\$/);
  expect(await verifyPassword({hash:stored,password})).toBe(true);
  expect(await verifyPassword({hash:stored,password:"incorrect"})).toBe(false);
});
it("rejects bcrypt byte truncation", () => expect(() => hashPassword("😀".repeat(19))).toThrow("byte limit"));
