export const AVATAR_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const AVATAR_MAX_DATA_LENGTH = 280_000;
export const AVATAR_MAX_DIMENSION = 512;
const types = ["image/jpeg", "image/png", "image/webp"];
export function avatarFileError(file: { type: string; size: number }) {
  if (!types.includes(file.type)) return "Choose a JPEG, PNG or WebP image.";
  if (file.size <= 0 || file.size > AVATAR_MAX_FILE_BYTES) return "Choose an image smaller than 5 MB.";
  return null;
}
export function avatarDimensions(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || width * height > 25_000_000) throw new Error("This image is too large to process. Choose a smaller photo.");
  const scale = Math.min(1, AVATAR_MAX_DIMENSION / width, AVATAR_MAX_DIMENSION / height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
export function validAvatarData(value: string) {
  if (value.length > AVATAR_MAX_DATA_LENGTH) return false;
  const match = /^data:image\/(jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[2].length % 4 !== 0) return false;
  try {
    const bytes = atob(match[2]);
    return match[1] === "jpeg" ? bytes.startsWith("\xff\xd8\xff") : bytes.startsWith("RIFF") && bytes.slice(8, 12) === "WEBP";
  } catch { return false; }
}
export async function compressAvatar(file: File): Promise<string> {
  const error = avatarFileError(file); if (error) throw new Error(error);
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error("This file could not be read as an image."); });
  try {
    const size = avatarDimensions(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas"); canvas.width = size.width; canvas.height = size.height;
    const context = canvas.getContext("2d"); if (!context) throw new Error("Photo processing is unavailable in this browser.");
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    for (const quality of [0.82, 0.65, 0.45]) {
      let result = canvas.toDataURL("image/webp", quality);
      if (!result.startsWith("data:image/webp;")) result = canvas.toDataURL("image/jpeg", quality);
      if (validAvatarData(result)) return result;
    }
    throw new Error("This photo is too detailed. Please choose a smaller image.");
  } finally { bitmap.close(); }
}
