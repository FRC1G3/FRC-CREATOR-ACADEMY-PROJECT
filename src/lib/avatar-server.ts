import "server-only";
import sharp from "sharp";
import { AVATAR_MAX_DATA_LENGTH, AVATAR_MAX_DIMENSION, validAvatarData } from "./avatar";

export async function normalizeAvatar(value: string) {
  if (!validAvatarData(value)) throw new Error("Invalid photo.");
  const bytes = Buffer.from(value.slice(value.indexOf(",") + 1), "base64");
  // Decode and re-encode, not just trust a MIME prefix from the client.
  const image = sharp(bytes, { limitInputPixels: AVATAR_MAX_DIMENSION ** 2, failOn: "warning" });
  const meta = await image.metadata();
  if (!["jpeg", "webp"].includes(meta.format ?? "") || !meta.width || !meta.height || meta.width > AVATAR_MAX_DIMENSION || meta.height > AVATAR_MAX_DIMENSION || (meta.pages ?? 1) > 1) throw new Error("Invalid photo dimensions.");
  const output = await image.rotate().webp({ quality: 80 }).toBuffer();
  const result = `data:image/webp;base64,${output.toString("base64")}`;
  if (result.length > AVATAR_MAX_DATA_LENGTH) throw new Error("Photo is too large.");
  return result;
}
