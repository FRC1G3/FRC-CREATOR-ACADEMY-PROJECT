import { expect, it } from "vitest";
import sharp from "sharp";
import { avatarDimensions, avatarFileError, validAvatarData, AVATAR_MAX_DATA_LENGTH } from "../src/lib/avatar";
import { normalizeAvatar } from "../src/lib/avatar-server";
import { imageSource } from "../src/lib/image-source";
it.each(["image/jpeg", "image/png", "image/webp"])("accepts supported original MIME %s", type => expect(avatarFileError({ type, size: 1000 })).toBeNull());
it.each(["text/plain", "image/svg+xml", "application/pdf"])("rejects unsupported MIME %s", type => expect(avatarFileError({ type, size: 1000 })).toBeTruthy());
it("rejects empty and oversized originals", () => {
  expect(avatarFileError({ type: "image/png", size: 0 })).toBeTruthy();
  expect(avatarFileError({ type: "image/png", size: 6 * 1024 * 1024 })).toBeTruthy();
});
it("resizes with aspect ratio and never enlarges a small photo", () => {
  expect(avatarDimensions(2048, 1024)).toEqual({ width: 512, height: 256 });
  expect(avatarDimensions(64, 100)).toEqual({ width: 64, height: 100 });
  expect(() => avatarDimensions(50000, 50000)).toThrow();
  expect(() => avatarDimensions(NaN, 1)).toThrow();
});
it("rejects arbitrary files disguised as data URLs and giant payloads", () => {
  expect(validAvatarData("data:image/webp;base64,SGVsbG8=")).toBe(false);
  expect(validAvatarData("data:image/svg+xml;base64,SGVsbG8=")).toBe(false);
  expect(validAvatarData("data:image/jpeg;base64," + "a".repeat(AVATAR_MAX_DATA_LENGTH))).toBe(false);
});
it("decodes and re-encodes valid photos into small WebP data without optimizer fetches", async () => {
  const bytes = await sharp({ create: { width: 100, height: 80, channels: 3, background: "red" } }).jpeg().toBuffer();
  const result = await normalizeAvatar(`data:image/jpeg;base64,${bytes.toString("base64")}`);
  expect(validAvatarData(result)).toBe(true); expect(result.length).toBeLessThan(AVATAR_MAX_DATA_LENGTH);
  expect(imageSource(result)).toEqual({ src: result, unoptimized: true });
});
it("rejects a forged image signature and excessive server dimensions", async () => {
  await expect(normalizeAvatar("data:image/jpeg;base64,/9j/AAAA")).rejects.toThrow();
  const bytes = await sharp({ create: { width: 600, height: 1, channels: 3, background: "red" } }).jpeg().toBuffer();
  await expect(normalizeAvatar(`data:image/jpeg;base64,${bytes.toString("base64")}`)).rejects.toThrow();
});
