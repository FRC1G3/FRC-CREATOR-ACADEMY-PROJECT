"use client";
import { useActionState, useState } from "react";
import { unstable_rethrow } from "next/navigation";
import { saveProfile } from "@/actions/learning";
import { compressAvatar } from "@/lib/avatar";
import DatabaseImage from "@/components/learning/DatabaseImage";
import { notifyStatus } from "@/components/learning/StatusToast";
import type { ActionState } from "@/lib/validation";
export default function ProfileEdit({ name, bio, avatar, open, setOpen }: { name: string; bio: string; avatar: string; open: boolean; setOpen: (value: boolean) => void }) {
  const [draft, setDraft] = useState({ name, bio, avatar });
  const [photoError, setPhotoError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [state, submit, pending] = useActionState(async (previous: ActionState, data: FormData) => {
    try {
    const result = await saveProfile(previous, data);
    if (result.success) { setOpen(false); notifyStatus(result.success); }
    return result;
    } catch (error) { unstable_rethrow(error); return { error: "Unable to save profile. Please try again." }; }
  }, {});
  async function choosePhoto(file?: File) {
    if (!file) return;
    setProcessing(true); setPhotoError("");
    try { const image = await compressAvatar(file); setDraft(previous => ({ ...previous, avatar: image })); }
    catch (error) { setPhotoError(error instanceof Error ? error.message : "Unable to process photo."); }
    finally { setProcessing(false); }
  }
  return <>
    <button type="button" className="profile-primary" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="profile-edit-form">Edit Profile</button>
    <form hidden={!open} inert={!open} id="profile-edit-form" className="profile-edit" action={submit}>
      <label>Name<input name="name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} required maxLength={100} /></label>
      <label>Bio<textarea name="bio" value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value })} maxLength={1000} /></label>
      <div className="profile-photo-picker">
        <DatabaseImage src={draft.avatar} fallback="/images/profiles/frc.PNG" alt="Profile photo preview" width={80} height={80} />
        <label>Profile Photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={pending || processing} aria-describedby="profile-photo-help" onChange={e => { void choosePhoto(e.target.files?.[0]); e.target.value = ""; }} /></label>
        <small id="profile-photo-help">JPEG, PNG or WebP, up to 5 MB. Photos are resized automatically.</small>
        {processing && <p role="status">Preparing photo...</p>}
        {photoError && <p role="alert">{photoError}</p>}
      </div>
      <input type="hidden" name="avatarUrl" value={draft.avatar} />
      <button type="submit" disabled={pending || processing}>{pending ? "Saving..." : "Save Profile"}</button>
      <button type="button" disabled={pending} onClick={() => setOpen(false)}>Close</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  </>;
}
