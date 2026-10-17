import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import api from "../api.js";
import PasswordField from "./PasswordField.jsx";
function ResetShell({ children }) {
  return (
    <main className="auth password-recovery">
      <Link className="recovery-brand" to="/">
        prakash<span> saas world</span>
      </Link>
      <section className="recovery-card">{children}</section>
    </main>
  );
}
export function ForgotPasswordPage({ GoogleSignIn }) {
  const [error, setError] = useState("");
  return (
    <ResetShell>
      <span className="recovery-icon">
        <ShieldCheck size={24} />
      </span>
      <small className="eyebrow">ACCOUNT RECOVERY</small>
      <h1>Forgot your password?</h1>
      <p>
        Verify the Google account you used to create your account. Then choose a
        new password.
      </p>
      <div className="recovery-google">
        <GoogleSignIn purpose="reset" onError={setError} />
        {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <p role="status">
            Google verification is currently unavailable. Please try again
            later.
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <p className="recovery-note">
        Your current password stays unchanged until you save a new one.
        Verification expires after 15 minutes.
      </p>
      <Link className="recovery-back" to="/login">
        ← Back to log in
      </Link>
    </ResetShell>
  );
}
export function ResetPasswordPage() {
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  useEffect(() => {
    let active = true;
    api
      .get("/auth/password-reset-session")
      .then((r) => {
        if (active) setUser(r.data.user);
      })
      .catch(() => {
        if (active)
          setError(
            "Your reset session has expired or was already used. Verify your Google account again.",
          );
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { password });
      setPassword("");
      setConfirm("");
      setDone(true);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Could not reset your password. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (checking)
    return (
      <ResetShell>
        <p role="status">Checking your reset session…</p>
      </ResetShell>
    );
  if (done)
    return (
      <ResetShell>
        <span className="recovery-icon">
          <ShieldCheck size={24} />
        </span>
        <h1>Password updated.</h1>
        <p role="status">
          Your password has been reset and previous sign-in sessions have ended.
          Log in with your new password.
        </p>
        <Link className="btn dark" to="/login">
          Back to log in →
        </Link>
      </ResetShell>
    );
  return (
    <ResetShell>
      <span className="recovery-icon">
        <LockKeyhole size={24} />
      </span>
      <small className="eyebrow">A FRESH START</small>
      <h1>Reset your password.</h1>
      {user && (
        <>
          <p>
            Google verified <strong>{user.email}</strong>. Choose a new password
            between 8 and 128 characters.
          </p>
          <form className="recovery-form" onSubmit={submit}>
            <PasswordField
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordField
              label="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="btn dark" disabled={busy}>
              {busy ? "Saving…" : "Reset password →"}
            </button>
          </form>
        </>
      )}
      {!user && (
        <>
          <p className="error" role="alert">
            {error}
          </p>
          <Link className="btn dark" to="/forgot-password">
            Verify with Google again →
          </Link>
        </>
      )}
      <Link className="recovery-back" to="/login">
        ← Back to log in
      </Link>
    </ResetShell>
  );
}
