"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

type AuthInputProps = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  autoComplete: string;
  error?: string;
  hint?: string;
};

export default function AuthInput({ id, label, type, placeholder, autoComplete, error, hint }: AuthInputProps) {
  const [value, setValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const Icon = type === "password" ? LockKeyhole : type === "email" ? Mail : UserRound;

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <Icon size={20} aria-hidden="true" />
        <input id={id} name={id} type={type === "password" && showPassword ? "text" : type}
          placeholder={placeholder} autoComplete={autoComplete} value={value} onChange={event => setValue(event.target.value)}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} />
        {type === "password" && (
          <button className="auth-password-toggle" type="button"
            aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={showPassword} aria-controls={id}
            onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        )}
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
      {error && <small id={`${id}-error`} role="alert">{error}</small>}
    </div>
  );
}
