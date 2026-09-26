"use client";
import { useActionState, useState } from "react";
import { saveProfile } from "@/actions/learning";
export default function ProfileEdit({ name, bio, avatar }: { name: string; bio: string; avatar: string }) {
  const [open, setOpen] = useState(false);
  const [state, submit, pending] = useActionState(saveProfile, {});
  return <><button type="button" className="profile-primary" onClick={() => setOpen(!open)} aria-expanded={open}>Edit Profile</button>{open && <form className="profile-edit" action={submit}><label>Name<input name="name" defaultValue={name} required maxLength={100} /></label><label>Bio<textarea name="bio" defaultValue={bio} maxLength={1000} /></label><label>Avatar URL<input name="avatarUrl" defaultValue={avatar} /></label><button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Profile"}</button><button type="button" onClick={() => setOpen(false)}>Close</button>{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}</form>}</>;
}
