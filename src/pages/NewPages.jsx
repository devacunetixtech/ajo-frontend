import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AppShell, Icon, TrustBadge, StatusBadge } from "../components/layout/index";
import { GroupDetailSkeleton } from "../components/ui/Skeleton";
import api from "../services/api";

const fmt = (n) => `₦${Number(n).toLocaleString("en-NG")}`;

// ─── Shared auth layout (imported pattern from Auth.jsx) ────────────────────
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-background flex">
    <div className="hidden lg:flex lg:w-1/2 bg-primary-gradient flex-col justify-between p-16">
      <div>
        <h1 className="font-headline italic text-4xl text-on-primary tracking-tight">AjoSave</h1>
        <p className="text-[11px] uppercase tracking-[0.25em] text-on-primary/50 mt-2">The Financial Atelier</p>
      </div>
      <blockquote className="font-headline italic text-3xl text-on-primary/80 leading-snug">
        "A trusted circle of growth, digitised."
      </blockquote>
      <p className="text-[10px] text-on-primary/30 uppercase tracking-widest">© {new Date().getFullYear()} AjoSave</p>
    </div>
    <div className="flex-1 flex items-center justify-center px-8 py-16">
      <div className="w-full max-w-md">
        <div className="mb-12 lg:hidden">
          <h1 className="font-headline italic text-3xl text-primary">AjoSave</h1>
        </div>
        <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-3">{subtitle}</p>
        <h2 className="font-headline text-4xl text-on-surface mb-12 tracking-tight">{title}</h2>
        {children}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally { setBusy(false); }
  };

  if (sent) return (
    <AuthLayout title="Check your inbox." subtitle="Password Reset">
      <div className="bg-primary-fixed/30 border border-primary-fixed rounded-lg p-8 mb-8">
        <p className="text-sm text-on-surface leading-relaxed">
          If <strong>{email}</strong> is registered with AjoSave, a reset link has been sent. Check your inbox — and your spam folder.
        </p>
      </div>
      <p className="text-sm text-on-surface-variant">
        Remembered it?{" "}
        <Link to="/login" className="text-primary font-bold underline underline-offset-4">Sign in</Link>
      </p>
    </AuthLayout>
  );

  return (
    <AuthLayout title="Reset your password." subtitle="Account Recovery">
      {error && <div className="mb-6 p-4 bg-error-container rounded text-sm text-on-error-container">{error}</div>}
      <p className="text-sm text-on-surface-variant mb-10 leading-relaxed">
        Enter the email address linked to your account. We'll send you a link to reset your password.
      </p>
      <form onSubmit={submit} className="space-y-8">
        <div>
          <label className="field-label">Email address</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email" className="field-input" placeholder="you@example.com"
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Sending…" : "Send Reset Link"}
        </button>
      </form>
      <p className="mt-10 text-sm text-on-surface-variant">
        <Link to="/login" className="text-primary font-bold underline underline-offset-4">← Back to Sign In</Link>
      </p>
    </AuthLayout>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. RESET PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form,  setForm]  = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy,  setBusy]  = useState(false);
  const token = new URLSearchParams(window.location.search).get("token");

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters.");
    setBusy(true); setError("");
    try {
      const { data } = await api.post("/auth/reset-password", { token, password: form.password });
      localStorage.setItem("ajo_token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally { setBusy(false); }
  };

  if (!token) return (
    <AuthLayout title="Invalid link." subtitle="Password Reset">
      <p className="text-sm text-on-surface-variant mb-6">This reset link is missing a token. Please request a new one.</p>
      <Link to="/forgot-password" className="btn-primary inline-block">Request new link</Link>
    </AuthLayout>
  );

  return (
    <AuthLayout title="Choose a new password." subtitle="Password Reset">
      {error && <div className="mb-6 p-4 bg-error-container rounded text-sm text-on-error-container">{error}</div>}
      <form onSubmit={submit} className="space-y-8">
        <div>
          <label className="field-label">New password</label>
          <input
            type="password" value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required minLength={8} autoComplete="new-password"
            className="field-input" placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="field-label">Confirm password</label>
          <input
            type="password" value={form.confirm}
            onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
            required autoComplete="new-password"
            className="field-input" placeholder="Repeat your new password"
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Resetting…" : "Set New Password"}
        </button>
      </form>
    </AuthLayout>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. RESEND VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
export const ResendVerificationPage = () => {
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await api.post("/auth/resend-verification", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally { setBusy(false); }
  };

  if (sent) return (
    <AuthLayout title="Email sent." subtitle="Verify Your Account">
      <div className="bg-primary-fixed/30 border border-primary-fixed rounded-lg p-8 mb-8">
        <p className="text-sm text-on-surface leading-relaxed">
          A new verification link has been sent to <strong>{email}</strong>. It expires in 24 hours.
        </p>
      </div>
      <Link to="/login" className="text-sm text-primary font-bold underline underline-offset-4">Back to Sign In</Link>
    </AuthLayout>
  );

  return (
    <AuthLayout title="Resend verification." subtitle="Account Activation">
      {error && <div className="mb-6 p-4 bg-error-container rounded text-sm text-on-error-container">{error}</div>}
      <p className="text-sm text-on-surface-variant mb-10 leading-relaxed">
        Didn't receive your verification email, or the link expired? Enter your email and we'll send a fresh one.
      </p>
      <form onSubmit={submit} className="space-y-8">
        <div>
          <label className="field-label">Email address</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email" className="field-input" placeholder="you@example.com"
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Sending…" : "Resend Verification Email"}
        </button>
      </form>
      <p className="mt-10 text-sm text-on-surface-variant">
        <Link to="/login" className="text-primary font-bold underline underline-offset-4">← Back to Sign In</Link>
      </p>
    </AuthLayout>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. KYC PAGE
// ─────────────────────────────────────────────────────────────────────────────
export const KYCPage = () => {
  const { user, loadUser } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [method, setMethod] = useState("bvn");
  const [value,  setValue]  = useState("");
  const [busy,   setBusy]   = useState(false);
  const [apiError, setApiError] = useState("");
  const [canRetry, setCanRetry] = useState(false);

  // Already verified — skip to dashboard
  useEffect(() => {
    if (user?.kycStatus === "verified") navigate("/dashboard");
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setApiError(""); setCanRetry(false);
    try {
      const { data } = await api.post("/kyc/verify", { method, value });
      await loadUser();
      success(data.message);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed.";
      setApiError(msg);
      setCanRetry(err.response?.data?.canRetry || false);
      toastError(msg);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-primary-gradient flex-col justify-between p-16">
        <div>
          <h1 className="font-headline italic text-4xl text-on-primary tracking-tight">AjoSave</h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-on-primary/50 mt-2">The Financial Atelier</p>
        </div>
        <div className="space-y-8">
          <h2 className="font-headline italic text-3xl text-on-primary/90 leading-snug">
            Identity verification protects every member in your circle.
          </h2>
          <div className="space-y-4">
            {[
              { icon: "shield",        text: "Ensures only real people join savings circles" },
              { icon: "verified_user", text: "Builds trust between members before money moves" },
              { icon: "lock",          text: "Your data is encrypted and never shared" },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-primary/60">{icon}</span>
                <p className="text-sm text-on-primary/70 font-label">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-on-primary/30 uppercase tracking-widest">© {new Date().getFullYear()} AjoSave</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="mb-3">
            <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60">Identity Verification</p>
          </div>
          <h2 className="font-headline text-3xl md:text-4xl text-on-surface mb-3 tracking-tight">Verify your identity.</h2>
          <p className="text-sm text-on-surface-variant mb-12 leading-relaxed">
            Choose one — your BVN or NIN. Either works. You only need to do this once.
          </p>

          {/* Already verified banner */}
          {user?.kycStatus === "failed" && (
            <div className="mb-8 p-4 bg-error-container border border-error/20 rounded text-sm text-on-error-container">
              A previous attempt failed. {canRetry ? `Try your ${method === "bvn" ? "NIN" : "BVN"} instead.` : "Please try again."}
            </div>
          )}

          {apiError && (
            <div className="mb-8 p-4 bg-error-container border border-error/20 rounded text-sm text-on-error-container">
              {apiError}
            </div>
          )}

          {/* Method selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {[
              { key: "bvn", label: "BVN", sub: "Bank Verification Number", hint: "11 digits linked to your bank account" },
              { key: "nin", label: "NIN",  sub: "National Identity Number", hint: "11 digits on your NIMC slip or NIN card" },
            ].map(({ key, label, sub, hint }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setMethod(key); setValue(""); setApiError(""); }}
                className={`p-5 rounded-lg border text-left transition-all ${
                  method === key
                    ? "border-primary bg-primary-fixed/20"
                    : "border-outline-variant/30 hover:border-outline-variant"
                }`}
              >
                <p className="font-label font-bold text-sm text-on-surface">{label}</p>
                <p className="text-[10px] font-label uppercase tracking-wide text-on-surface-variant mt-1">{sub}</p>
                <p className="text-[10px] text-on-surface-variant/60 mt-2 leading-relaxed">{hint}</p>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-8">
            <div>
              <label className="field-label">Your {method.toUpperCase()}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 11))}
                required
                maxLength={11}
                pattern="\d{11}"
                inputMode="numeric"
                className="field-input text-xl tracking-widest"
                placeholder="_ _ _ _ _ _ _ _ _ _ _"
              />
              <p className="text-[10px] text-on-surface-variant/60 mt-3">
                {method === "bvn"
                  ? "Dial *565*0# on any bank-registered phone to get your BVN."
                  : "Your NIN is on your NIMC enrolment slip or NIN card."}
              </p>
            </div>

            <button type="submit" disabled={busy || value.length !== 11} className="btn-primary w-full">
              {busy ? "Verifying…" : `Verify with ${method.toUpperCase()}`}
            </button>

            <div className="mt-6 pt-6 border-t border-outline-variant/20 text-center">
              <p className="text-xs text-on-surface-variant/60 mb-3">
                KYC service unavailable or want to explore first?
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors font-label"
              >
                <Icon name="arrow_forward" className="text-sm" />
                Continue to dashboard — verify later
              </Link>
              <p className="text-[10px] text-on-surface-variant/30 mt-4 leading-relaxed">
                You won't be able to join or create savings circles until your identity is verified.
              </p>
            </div>
          </form>

          <p className="mt-8 text-xs text-on-surface-variant/50 leading-relaxed text-center">
            Your {method.toUpperCase()} is verified against NIMC/NIBSS records and never stored in plain text. Powered by Prembly.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. PAYMENT CALLBACK
// ─────────────────────────────────────────────────────────────────────────────
export const PaymentCallbackPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [groupId, setGroupId] = useState(null);

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    const trxref    = params.get("trxref");
    const ref       = reference || trxref;

    if (!ref) { setStatus("failed"); return; }

    // First attempt: call the explicit verify endpoint
    api.get(`/contributions/verify/${ref}`)
      .then(({ data }) => {
        if (data.status === "success") {
          setGroupId(data.contribution?.groupId?._id || data.contribution?.groupId);
          setStatus("success");
          success("Payment confirmed! Your contribution has been recorded.");
        } else {
          setStatus("pending");
        }
      })
      .catch(() => {
        // Fallback: poll history (webhook might have already succeeded)
        api.get(`/contributions/history`)
          .then(({ data }) => {
            const contrib = data.contributions?.find((c) => c.paystackRef === ref);
            if (contrib?.status === "paid") {
              setGroupId(contrib.groupId?._id || contrib.groupId);
              setStatus("success");
              success("Payment confirmed!");
            } else {
              setStatus("pending");
            }
          })
          .catch(() => setStatus("failed"));
      });
  }, []);

  const STATE = {
    verifying: {
      icon:    "hourglass_top",
      title:   "Verifying payment…",
      sub:     "Please wait while we confirm your payment with Paystack.",
      color:   "text-secondary",
      animate: "animate-spin",
    },
    success: {
      icon:  "check_circle",
      title: "Payment confirmed.",
      sub:   "Your contribution has been recorded. The payout will be released once all members have paid.",
      color: "text-primary",
    },
    pending: {
      icon:  "pending",
      title: "Payment received.",
      sub:   "Your payment was received and is being confirmed. Check your group's status in a moment.",
      color: "text-secondary",
    },
    failed: {
      icon:  "error",
      title: "Something went wrong.",
      sub:   "We couldn't verify your payment. If money left your account, contact support — it will be reconciled.",
      color: "text-error",
    },
  };

  const s = STATE[status] || STATE.verifying;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 md:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="font-headline italic text-3xl text-primary mb-16">AjoSave</h1>

        <span className={`material-symbols-outlined text-6xl mb-6 block ${s.color} ${s.animate || ""}`}>
          {s.icon}
        </span>

        <h2 className="font-headline text-3xl text-on-surface mb-4">{s.title}</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-12 max-w-xs mx-auto">{s.sub}</p>

        <div className="flex flex-col gap-3">
          {status !== "verifying" && groupId && (
            <button onClick={() => navigate(`/groups/${groupId}`)} className="btn-primary w-full">
              Back to circle
            </button>
          )}
          {status !== "verifying" && !groupId && (
            <button onClick={() => navigate("/groups")} className="btn-primary w-full">
              View my circles
            </button>
          )}
          {status === "failed" && (
            <button onClick={() => navigate("/dashboard")} className="btn-ghost w-full">
              Go to dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. INVITE / JOIN PAGE  — handles /join/:code direct links from WhatsApp
// ─────────────────────────────────────────────────────────────────────────────
export const InvitePage = () => {
  const { code }   = useParams();
  const { user }   = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate   = useNavigate();

  const [group,   setGroup]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined,  setJoined]  = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/groups/invite/${code}`)
      .then(r => setGroup(r.data.group))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  const doJoin = async () => {
    if (!user) {
      navigate(`/login?redirect=/join/${code}`);
      return;
    }
    if (user.kycStatus !== "verified") {
      navigate("/kyc");
      return;
    }
    setJoining(true);
    try {
      await api.post("/groups/join", { inviteCode: code });
      setJoined(true);
      toastSuccess(`You've joined ${group.name}!`);
    } catch (err) {
      toastError(err.response?.data?.message || "Could not join group.");
    } finally { setJoining(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-headline italic text-3xl text-primary animate-pulse">AjoSave</p>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 md:px-8">
      <div className="text-center">
        <h1 className="font-headline italic text-3xl text-primary mb-8">AjoSave</h1>
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">link_off</span>
        <h2 className="font-headline text-3xl text-on-surface mb-3">Invalid invite link.</h2>
        <p className="text-sm text-on-surface-variant mb-8">This circle doesn't exist or the link has expired. Ask the admin for a fresh invite code.</p>
        {user
          ? <Link to="/groups" className="btn-primary inline-block">View my circles</Link>
          : <Link to="/login"  className="btn-primary inline-block">Sign in</Link>
        }
      </div>
    </div>
  );

  const isMember = user && group?.members?.some?.(m =>
    (m.userId?._id || m.userId) === user._id
  );
  const isFull   = group.members?.length >= group.maxMembers;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 md:px-8 py-10 md:py-16">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <h1 className="font-headline italic text-3xl text-primary">AjoSave</h1>
        </div>

        {joined ? (
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-primary mb-6 block">celebration</span>
            <h2 className="font-headline text-4xl text-on-surface mb-4">You're in!</h2>
            <p className="text-sm text-on-surface-variant mb-10">You've joined <strong>{group.name}</strong>. The admin will start the cycle once everyone is ready.</p>
            <Link to={`/groups`} className="btn-primary inline-block">Go to my circles</Link>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-3">You've been invited to join</p>
            <h2 className="font-headline text-4xl md:text-5xl text-primary tracking-tight mb-10">{group.name}</h2>

            {/* Group details */}
            <div className="bg-surface-container-low p-8 rounded-lg mb-10 space-y-5">
              {[
                { label: "Contribution", value: fmt(group.contributionAmount) },
                { label: "Frequency",    value: group.frequency.charAt(0).toUpperCase() + group.frequency.slice(1) },
                { label: "Pool per cycle", value: fmt(group.contributionAmount * group.maxMembers) },
                { label: "Members",      value: `${group.members?.length || 0} / ${group.maxMembers}` },
                { label: "Admin",        value: group.adminId?.name || "—" },
                { label: "Status",       value: group.status.charAt(0).toUpperCase() + group.status.slice(1) },
              ].map(({ label, value }) => (
                <div key={label} className="growth-ledger-row">
                  <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{label}</span>
                  <span />
                  <span className="font-headline text-xl text-on-surface">{value}</span>
                </div>
              ))}
            </div>

            {/* KYC warning */}
            {user && user.kycStatus !== "verified" && (
              <div className="mb-6 p-4 bg-error-container/50 border border-error/20 rounded text-sm text-on-error-container">
                <strong>Identity verification required.</strong> Complete KYC before joining a circle.
                <Link to="/kyc" className="block mt-2 font-bold underline">Verify now →</Link>
              </div>
            )}

            {isMember && (
              <div className="mb-6 p-4 bg-primary-fixed/30 rounded text-sm text-primary font-medium">
                You're already a member of this circle.
              </div>
            )}

            {isFull && !isMember && (
              <div className="mb-6 p-4 bg-surface-container rounded text-sm text-on-surface-variant">
                This circle is full and not accepting new members.
              </div>
            )}

            {group.status !== "waiting" && !isMember && (
              <div className="mb-6 p-4 bg-surface-container rounded text-sm text-on-surface-variant">
                This circle has already started and is not accepting new members.
              </div>
            )}

            <div className="flex flex-col gap-3">
              {!isMember && !isFull && group.status === "waiting" && (
                <button onClick={doJoin} disabled={joining} className="btn-primary w-full">
                  {!user ? "Sign in to join" : joining ? "Joining…" : `Join ${group.name}`}
                </button>
              )}
              {isMember && (
                <Link to="/groups" className="btn-primary w-full text-center">View my circles</Link>
              )}
              {!user && (
                <Link to="/register" className="btn-ghost w-full text-center">Create an account</Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. ADMIN GROUP PAGE
// ─────────────────────────────────────────────────────────────────────────────
export const AdminGroupPage = () => {
  const { id }    = useParams();
  const { user }  = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate  = useNavigate();

  const [group,       setGroup]       = useState(null);
  const [cycleStatus, setCycleStatus] = useState(null);
  const [payouts,     setPayouts]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [payoutBusy,  setPayoutBusy]  = useState(false);
  const [startBusy,   setStartBusy]   = useState(false);
  const [removingId,  setRemovingId]  = useState(null);

  const load = useCallback(async () => {
    try {
      const [g, p] = await Promise.all([api.get(`/groups/${id}`), api.get(`/payouts/${id}`)]);
      setGroup(g.data.group);
      setPayouts(p.data.payouts);
      if (g.data.group.status === "active") {
        const cs = await api.get(`/contributions/${id}/status`);
        setCycleStatus(cs.data);
      }
    } catch { navigate("/groups"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Redirect non-admins to member view
  useEffect(() => {
    if (group && user) {
      const isAdmin = group.adminId?._id === user._id || group.adminId === user._id;
      if (!isAdmin) navigate(`/groups/${id}`);
    }
  }, [group, user]);

  const startCycle = async () => {
    setStartBusy(true);
    try {
      await api.post(`/groups/${id}/start`);
      toastSuccess("Cycle started! Turn order has been assigned.");
      await load();
    } catch (err) {
      toastError(err.response?.data?.message || "Could not start cycle.");
    } finally { setStartBusy(false); }
  };

  const removeMember = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from this circle?`)) return;
    setRemovingId(memberId);
    try {
      await api.delete(`/groups/${id}/members/${memberId}`);
      toastSuccess(`${memberName} removed from the circle.`);
      await load();
    } catch (err) {
      toastError(err.response?.data?.message || "Could not remove member.");
    } finally { setRemovingId(null); }
  };

  const triggerPayout = async () => {
    setPayoutBusy(true);
    try {
      const { data } = await api.post(`/payouts/${id}`);
      toastSuccess(data.message || `Payout of ${fmt(data.amount)} sent to ${data.recipient}.`);
      await load();
    } catch (err) {
      const msg = err.response?.data?.message || "Payout failed.";
      const unpaid = err.response?.data?.unpaidMembers;
      toastError(unpaid ? `${msg} — ${unpaid.join(", ")} haven't paid.` : msg);
    } finally { setPayoutBusy(false); }
  };

  if (loading) return <AppShell><GroupDetailSkeleton /></AppShell>;

  const recipientIndex = group.currentCycle > 0
    ? (group.currentCycle - 1) % (group.turnOrder?.length || 1)
    : 0;
  const thisRecipient = group.turnOrder?.[recipientIndex];
  const poolAmount    = group.contributionAmount * group.members.length;

  return (
    <AppShell>
      <section className="px-6 md:px-12 py-8 md:py-12">

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/groups" className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 hover:text-primary inline-flex items-center gap-1">
              <Icon name="arrow_back" className="text-sm" /> Circles
            </Link>
            <span className="text-outline-variant/40">/</span>
            <span className="text-[10px] font-label uppercase tracking-widest text-primary">Admin View</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">
                Admin · {group.frequency} · {fmt(group.contributionAmount)} per member
              </p>
              <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight">{group.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Invite Code</p>
              <p className="font-headline text-3xl text-primary tracking-[0.2em]">{group.inviteCode}</p>
              <a
                href={`${window.location.origin}/join/${group.inviteCode}`}
                className="text-[10px] text-primary underline underline-offset-4 mt-1 inline-block"
                onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(`${window.location.origin}/join/${group.inviteCode}`); toastSuccess("Invite link copied!"); }}
              >
                Copy invite link
              </a>
            </div>
          </div>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Members",       value: `${group.members.length}/${group.maxMembers}` },
            { label: "Current Cycle", value: group.status === "active" ? `${group.currentCycle}/${group.turnOrder?.length}` : "—" },
            { label: "Pool per Cycle",value: fmt(poolAmount) },
            { label: "Status",        value: group.status.charAt(0).toUpperCase() + group.status.slice(1) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-container-low p-6 rounded-lg">
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
              <p className="font-headline text-3xl text-primary">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

          {/* Left — cycle management */}
          <div className="col-span-12 lg:col-span-7 space-y-8">

            {/* ── WAITING: Member table with remove ─────────────────────── */}
            {group.status === "waiting" && (
              <div className="card p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-headline text-2xl text-on-surface mb-2">Members</h3>
                    <p className="text-sm text-on-surface-variant">
                      {group.members.length} of {group.maxMembers} spots filled.
                      {group.members.length >= 2 && " You can start the cycle whenever ready."}
                    </p>
                  </div>
                </div>

                <div className="w-full overflow-x-auto hide-scrollbar">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      {["Member","Trust Score","Joined","Action"].map(h => (
                        <th key={h} className="pb-3 text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.members.map((m) => {
                      const isAdmin = (m.userId?._id || m.userId) === (group.adminId?._id || group.adminId);
                      const uid     = m.userId?._id || m.userId;
                      return (
                        <tr key={uid} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed flex-shrink-0">
                                {m.userId?.name?.[0] || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{m.userId?.name}</p>
                                {isAdmin && <p className="text-[10px] text-on-surface-variant">Admin</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-4"><TrustBadge score={m.userId?.trustScore ?? 0} /></td>
                          <td className="py-4 text-sm text-on-surface-variant">
                            {new Date(m.joinedAt).toLocaleDateString("en-NG",{month:"short",day:"numeric"})}
                          </td>
                          <td className="py-4">
                            {!isAdmin && (
                              <button
                                onClick={() => removeMember(uid, m.userId?.name)}
                                disabled={removingId === uid}
                                className="text-[10px] font-label uppercase tracking-widest text-error hover:underline disabled:opacity-40"
                              >
                                {removingId === uid ? "Removing…" : "Remove"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>

                {group.members.length >= 2 && (
                  <div className="mt-8 pt-8 border-t border-outline-variant/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-headline text-xl text-on-surface mb-1">Ready to begin?</p>
                        <p className="text-sm text-on-surface-variant">Starting the cycle will randomly assign the payout turn order and lock membership.</p>
                      </div>
                      <button onClick={startCycle} disabled={startBusy} className="btn-primary">
                        {startBusy ? "Starting…" : "Start Cycle →"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ACTIVE: Cycle status + payout ─────────────────────────── */}
            {group.status === "active" && cycleStatus && (
              <>
                {/* Payment status table */}
                <div className="card p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="font-headline text-2xl text-on-surface mb-1">Cycle {cycleStatus.cycleNumber} — Payment Status</h3>
                      <p className="text-sm text-on-surface-variant">Due {new Date(cycleStatus.dueDate).toDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">{cycleStatus.paidCount}/{cycleStatus.totalMembers} paid</p>
                      {cycleStatus.allPaid
                        ? <span className="badge-paid">All paid ✓</span>
                        : <span className="badge-pending">{cycleStatus.totalMembers - cycleStatus.paidCount} pending</span>
                      }
                    </div>
                  </div>

                  <div className="h-1.5 bg-surface-container w-full rounded-full overflow-hidden mb-8">
                    <div className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(cycleStatus.paidCount / cycleStatus.totalMembers) * 100}%` }} />
                  </div>

                  <div className="w-full overflow-x-auto hide-scrollbar">
                  <table className="w-full text-left min-w-[400px]">
                    <thead>
                      <tr className="border-b border-outline-variant/30">
                        {["Member","Trust","Status","Paid At"].map(h => (
                          <th key={h} className="pb-3 text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cycleStatus.statuses.map((s) => (
                        <tr key={s.userId} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed">{s.name[0]}</div>
                              <span className="text-sm font-medium">{s.name}</span>
                            </div>
                          </td>
                          <td className="py-4"><TrustBadge score={s.trustScore || 0} /></td>
                          <td className="py-4"><StatusBadge status={s.status} /></td>
                          <td className="py-4 text-sm text-on-surface-variant">
                            {s.paidAt ? new Date(s.paidAt).toLocaleString("en-NG",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>

                {/* Payout card */}
                <div className="card p-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-headline text-2xl text-on-surface mb-2">Release Payout</h3>
                      <p className="text-sm text-on-surface-variant mb-1">
                        This cycle's recipient: <strong className="text-primary">{thisRecipient?.name || "—"}</strong>
                      </p>
                      {!cycleStatus.allPaid && (
                        <p className="text-xs text-error mt-2">
                          Waiting on {cycleStatus.totalMembers - cycleStatus.paidCount} member{cycleStatus.totalMembers - cycleStatus.paidCount !== 1 ? "s" : ""} to pay before payout can be released.
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Payout amount</p>
                      <p className="font-headline text-4xl text-primary">{fmt(poolAmount)}</p>
                    </div>
                  </div>

                  <button
                    onClick={triggerPayout}
                    disabled={!cycleStatus.allPaid || payoutBusy}
                    className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {payoutBusy
                      ? "Processing transfer…"
                      : cycleStatus.allPaid
                        ? `Send ${fmt(poolAmount)} to ${thisRecipient?.name || "recipient"} →`
                        : `Locked — ${cycleStatus.totalMembers - cycleStatus.paidCount} member(s) haven't paid`
                    }
                  </button>
                </div>
              </>
            )}

            {group.status === "completed" && (
              <div className="card p-10 text-center">
                <Icon name="celebration" className="text-5xl text-primary mb-4" />
                <h3 className="font-headline text-3xl text-primary mb-3">Circle Complete!</h3>
                <p className="text-on-surface-variant">All {group.turnOrder?.length} cycles finished. Every member received their payout.</p>
              </div>
            )}
          </div>

          {/* Right — turn order + payout history */}
          <div className="col-span-12 lg:col-span-5 space-y-8">

            {/* Turn order */}
            {group.status !== "waiting" && group.turnOrder?.length > 0 && (
              <div className="bg-surface-container-low p-8 rounded-lg">
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-6">Payout Turn Order</p>
                <div className="space-y-3">
                  {group.turnOrder.map((m, i) => {
                    const isPast    = i < group.currentCycle - 1;
                    const isCurrent = i === group.currentCycle - 1;
                    return (
                      <div key={m._id || m} className={`flex items-center gap-3 p-3 rounded transition-colors ${isCurrent ? "bg-primary-fixed/30" : ""}`}>
                        <span className={`text-[10px] font-label w-6 text-right flex-shrink-0 ${isPast ? "text-on-surface-variant/30" : isCurrent ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                          {i + 1}
                        </span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isPast ? "bg-surface-container text-on-surface-variant/30" : "bg-primary-fixed text-on-primary-fixed"}`}>
                          {m.name?.[0] || "?"}
                        </div>
                        <span className={`text-sm flex-1 ${isPast ? "text-on-surface-variant/30 line-through" : isCurrent ? "text-primary font-medium" : "text-on-surface"}`}>
                          {m.name || "—"}
                        </span>
                        {isPast    && <Icon name="check_circle" className="text-sm text-on-surface-variant/30" />}
                        {isCurrent && <span className="text-[10px] font-label uppercase tracking-widest text-primary">Current</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payout history */}
            <div className="bg-surface-container-low p-8 rounded-lg">
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-6">Payout History</p>
              {payouts.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic font-headline">No payouts yet.</p>
              ) : (
                <div className="space-y-4">
                  {payouts.map((p) => (
                    <div key={p._id} className="flex justify-between items-center py-3 border-b border-outline-variant/10 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{p.recipientId?.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">
                          Cycle {p.cycleNumber} · {p.status} {p.transferCode?.startsWith("TRF_SIM") && <span className="text-primary-fixed/60 lowercase italic">(Simulated)</span>}
                        </p>
                      </div>
                      <span className="font-headline text-xl text-primary">{fmt(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. 404 NOT FOUND
// ─────────────────────────────────────────────────────────────────────────────
export const NotFoundPage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-8">
      <div className="max-w-md text-center">
        <h1 className="font-headline italic text-3xl text-primary mb-16">AjoSave</h1>
        <p className="font-headline text-[120px] leading-none text-surface-container-high select-none mb-4">404</p>
        <h2 className="font-headline text-3xl text-on-surface mb-4">Page not found.</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-12 max-w-xs mx-auto">
          The page you're looking for doesn't exist, or you may not have access to it.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {user ? (
            <>
              <Link to="/dashboard"    className="btn-primary w-full text-center">Go to Dashboard</Link>
              <Link to="/groups"       className="btn-ghost w-full text-center">View my Circles</Link>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-primary w-full text-center">Sign In</Link>
              <Link to="/register" className="btn-ghost w-full text-center">Create an account</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};