"use client";
import { useContext, useState } from "react";
import DatabaseImage from "@/components/learning/DatabaseImage";
import { compressAvatar } from "@/lib/avatar";
import { AdminImageProcessing } from "./AdminEditor";

export default function AdminImageField({ value = "" }: { value?: string | null }) {
  const [image, setImage] = useState(value ?? "");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const setProcessing = useContext(AdminImageProcessing);
  async function choose(file?: File) {
    if (!file || busy) return;
    setBusy(true); setProcessing(count => count + 1); setError("");
    try { setImage(await compressAvatar(file)); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to read image."); }
    finally { setBusy(false); setProcessing(count => count - 1); }
  }
  return <div className="admin-image-field">
    <DatabaseImage src={image} fallback="/images/hero.png" alt="Current thumbnail preview" width={240} height={135} />
    <label className="admin-form-field"><span>Thumbnail — Choose / Change Image</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => { void choose(event.target.files?.[0]); event.target.value = ""; }} /></label>
    <small>JPEG, PNG or WebP, up to 5 MB. Resized and compressed automatically.</small>
    <input type="hidden" name="thumbnailUrl" value={image} />
    {busy && <p role="status">Preparing image...</p>}{error && <p role="alert">{error}</p>}
  </div>;
}
