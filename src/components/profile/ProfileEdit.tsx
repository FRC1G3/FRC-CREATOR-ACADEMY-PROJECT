"use client";
import { useActionState, useState } from "react";
import { saveProfile } from "@/actions/learning";
export default function ProfileEdit({ name, bio, avatar }: { name: string; bio: string; avatar: string }) {
  const [draft, setDraft] = useState({ name, bio, avatar });
  const [open, setOpen] = useState(false);
  const [state, submit, pending] = useActionState(saveProfile, {});
  return <><button type="button" className="profile-primary" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="profile-edit-form">Edit Profile</button><form hidden={!open} inert={!open} id="profile-edit-form" className="profile-edit" action={submit}><label>Name<input name="name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} required maxLength={100} /></label><label>Bio<textarea name="bio" value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value })} maxLength={1000} /></label><label>Avatar URL<input name="avatarUrl" value={draft.avatar} onChange={e => setDraft({ ...draft, avatar: e.target.value })} /></label><button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Profile"}</button><button type="button" onClick={() => setOpen(false)}>Close</button>{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}</form></>;
}
