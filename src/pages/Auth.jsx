import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

// ─── Shared auth layout ───────────────────────────────────────────────────────
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-background flex">
    <div className="hidden lg:flex lg:w-1/2 bg-primary-gradient flex-col justify-between p-16">
      <div>
        <h1 className="font-headline italic text-4xl text-on-primary tracking-tight">AjoSave</h1>
        <p className="text-[11px] uppercase tracking-[0.25em] text-on-primary/50 mt-2">The Financial Atelier</p>
      </div>
      <div>
        <blockquote className="font-headline italic text-3xl text-on-primary/80 leading-snug mb-6">
          "A trusted circle of growth, digitised."
        </blockquote>
        <p className="text-sm text-on-primary/50 font-label tracking-wide">
          Cooperative savings for the modern Nigerian — secure, transparent, automatic.
        </p>
      </div>
      <p className="text-[10px] text-on-primary/30 uppercase tracking-widest">
        © {new Date().getFullYear()} AjoSave
      </p>
    </div>
    <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 lg:hidden text-center md:text-left">
          <h1 className="font-headline italic text-4xl text-primary mb-2">AjoSave</h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/70">The Financial Atelier</p>
        </div>
        <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-3">{subtitle}</p>
        <h2 className="font-headline text-3xl md:text-4xl text-on-surface mb-12 tracking-tight">{title}</h2>
        {children}
      </div>
    </div>
  </div>
);

// ─── Register ─────────────────────────────────────────────────────────────────
export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate      = useNavigate();
  const [form, setForm]   = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [done,  setDone]  = useState(false);
  const [busy,  setBusy]  = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await register(form.name, form.email, form.password, form.phone);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally { setBusy(false); }
  };

  if (done) return (
    <AuthLayout title="Check your email." subtitle="Almost there">
      <div className="bg-primary-fixed/30 border border-primary-fixed rounded-lg p-8 mb-8">
        <p className="text-sm text-on-surface font-body leading-relaxed">
          A verification link has been sent to <strong>{form.email}</strong>. Click it to activate your account and start saving.
        </p>
      </div>
      <div className="space-y-3">
        <p className="text-sm text-on-surface-variant">
          Already verified?{" "}
          <Link to="/login" className="text-primary font-bold underline underline-offset-4">Sign in</Link>
        </p>
        <p className="text-sm text-on-surface-variant">
          Didn't receive it?{" "}
          <Link to="/resend-verification" className="text-primary font-bold underline underline-offset-4">Resend email</Link>
        </p>
      </div>
    </AuthLayout>
  );

  return (
    <AuthLayout title="Create an account." subtitle="Step 01 — Registration">
      {error && (
        <div className="mb-6 p-4 bg-error-container border border-error/20 rounded text-sm text-on-error-container">
          {error}
        </div>
      )}
      <form onSubmit={submit} className="space-y-8">
        <div>
          <label className="field-label">Full name</label>
          <input name="name" value={form.name} onChange={onChange} required autoComplete="name"
            className="field-input" placeholder="Adebisi Oladapo" />
        </div>
        <div>
          <label className="field-label">Email address</label>
          <input name="email" type="email" value={form.email} onChange={onChange} required autoComplete="email"
            className="field-input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="field-label">Phone number <span className="opacity-40">(optional — for SMS reminders)</span></label>
          <input name="phone" value={form.phone} onChange={onChange} autoComplete="tel"
            className="field-input" placeholder="2348012345678" />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input name="password" type="password" value={form.password} onChange={onChange}
            required minLength={8} autoComplete="new-password"
            className="field-input" placeholder="At least 8 characters" />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full mt-4">
          {busy ? "Creating account…" : "Create Account"}
        </button>
      </form>
      <p className="mt-10 text-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-bold underline underline-offset-4">Sign in</Link>
      </p>
    </AuthLayout>
  );
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const { login, user }  = useAuth();
  const navigate         = useNavigate();
  const [searchParams]   = useSearchParams();
  const redirectTo       = searchParams.get("redirect") || "/dashboard";

  const [form, setForm]    = useState({ email: "", password: "" });
  const [error, setError]  = useState("");
  const [resend, setResend] = useState(false);
  const [busy, setBusy]    = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(""); setResend(false);
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setError(msg);
      if (err.response?.data?.resendAvailable) setResend(true);
    } finally { setBusy(false); }
  };

  return (
    <AuthLayout title="Welcome back." subtitle="Sign in to continue">
      {error && (
        <div className="mb-6 p-4 bg-error-container border border-error/20 rounded text-sm text-on-error-container">
          {error}
          {resend && (
            <Link to="/resend-verification" className="block mt-3 font-bold underline">
              Resend verification email →
            </Link>
          )}
        </div>
      )}
      <form onSubmit={submit} className="space-y-8">
        <div>
          <label className="field-label">Email address</label>
          <input name="email" type="email" value={form.email} onChange={onChange}
            required autoComplete="email" className="field-input" placeholder="you@example.com" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="field-label" style={{ margin: 0 }}>Password</label>
            <Link to="/forgot-password"
              className="text-[10px] font-label uppercase tracking-widest text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <input name="password" type="password" value={form.password} onChange={onChange}
            required autoComplete="current-password" className="field-input" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <p className="mt-10 text-sm text-on-surface-variant">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary font-bold underline underline-offset-4">Create one</Link>
      </p>
    </AuthLayout>
  );
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const VerifyEmailPage = () => {
  const navigate  = useNavigate();
  const { loadUser } = useAuth();
  const { success } = useToast();
  const [status, setStatus] = useState("verifying");

  // Must use useEffect, not useState, for side effects
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setStatus("error"); return; }

    api.get(`/auth/verify-email?token=${token}`)
      .then(({ data }) => {
        localStorage.setItem("ajo_token", data.token);
        return loadUser();
      })
      .then(() => {
        setStatus("success");
        success("Email verified! Welcome to AjoSave.");
        // Redirect to KYC — first thing after email verification
        setTimeout(() => navigate("/kyc"), 1800);
      })
      .catch(() => setStatus("error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const STATE = {
    verifying: { headline: null,                 body: "Verifying your email…",                    bodyClass: "animate-pulse text-on-surface-variant" },
    success:   { headline: "You're verified.",   body: "Redirecting you to identity verification…", bodyClass: "text-on-surface-variant" },
    error:     { headline: "Link expired.",      body: "This link is invalid or has expired.",      bodyClass: "text-on-surface-variant", cta: true },
  };

  const s = STATE[status];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 md:px-8">
      <div className="max-w-md text-center">
        <h1 className="font-headline italic text-3xl text-primary mb-10">AjoSave</h1>

        {status === "verifying" && (
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-8" />
        )}
        {status === "success" && (
          <span className="material-symbols-outlined text-6xl text-primary mb-6 block">check_circle</span>
        )}
        {status === "error" && (
          <span className="material-symbols-outlined text-6xl text-error mb-6 block">error</span>
        )}

        {s.headline && (
          <p className="font-headline text-3xl text-on-surface mb-3">{s.headline}</p>
        )}
        <p className={`text-sm mb-8 ${s.bodyClass}`}>{s.body}</p>

        {s.cta && (
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link to="/resend-verification" className="btn-primary inline-block text-center">
              Request new link
            </Link>
            <Link to="/login" className="btn-ghost inline-block text-center">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
