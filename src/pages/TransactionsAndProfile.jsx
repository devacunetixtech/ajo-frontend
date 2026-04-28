import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AppShell, Icon, TrustBadge, StatusBadge } from "../components/layout/index";
import { TransactionsEmptyState } from "../components/ui/Skeleton";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const fmt = (n) => `₦${Number(n).toLocaleString("en-NG")}`;

// ─── Transactions ─────────────────────────────────────────────────────────────
export function TransactionsPage() {
  const [contribs, setContribs] = useState([]);
  const [filter,   setFilter]   = useState("all");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get("/contributions/history")
      .then(r => setContribs(r.data.contributions))
      .finally(() => setLoading(false));
  }, []);

  const FILTERS = ["all","paid","pending","defaulted"];

  const filtered = filter === "all" ? contribs : contribs.filter(c => c.status === filter);
  const totalPaid    = contribs.filter(c => c.status === "paid").reduce((s,c) => s + c.amount, 0);
  const totalPending = contribs.filter(c => c.status === "pending").reduce((s,c) => s + c.amount, 0);

  return (
    <AppShell tabs={[{to:"/transactions",label:"Transactions"}]}>
      <section className="px-6 md:px-12 py-8 md:py-12">
        <div className="mb-12 md:mb-16">
          <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">Your Ledger</p>
          <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight">Transactions</h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 md:mb-16">
          {[
            { label: "Total Paid",     value: fmt(totalPaid) },
            { label: "Pending",        value: fmt(totalPending) },
            { label: "Total Records",  value: String(contribs.length) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-container-low p-8 rounded-lg">
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-3">{label}</p>
              <h2 className="font-headline text-4xl text-primary">{value}</h2>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-10">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-label uppercase tracking-widest px-4 py-2 rounded-full transition-all ${
                filter === f
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table or empty state */}
        {loading || filtered.length === 0 ? (
          <TransactionsEmptyState filter={filter} loading={loading} />
        ) : (
          <div className="w-full overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {["Date","Circle","Cycle","Status","Amount"].map(h => (
                  <th key={h} className={`pb-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant ${h==="Amount"?"text-right":""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-6 text-sm text-on-surface-variant">
                    {new Date(c.createdAt).toLocaleDateString("en-NG",{month:"short",day:"numeric",year:"numeric"})}
                  </td>
                  <td className="py-6 font-medium text-on-surface">{c.groupId?.name || "—"}</td>
                  <td className="py-6 text-sm text-on-surface-variant">#{c.cycleNumber}</td>
                  <td className="py-6"><StatusBadge status={c.status} /></td>
                  <td className="py-6 text-right font-headline text-xl text-on-surface">{fmt(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [form,  setForm]  = useState({
    name: "", phone: "", bankCode: "", accountNumber: "", accountName: ""
  });
  const [busy,  setBusy]  = useState(false);
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    api.get("/users/me").then(r => {
      const u = r.data.user;
      setForm({
        name:          u.name          || "",
        phone:         u.phone         || "",
        bankCode:      u.bankCode      || "",
        accountNumber: u.accountNumber || "",
        accountName:   u.accountName   || "",
      });
    });
    // Banks proxied through backend — Paystack public key stays server-side
    api.get("/users/banks")
      .then(r => setBanks(r.data.banks || []))
      .catch(() => {});
  }, []);

  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.put("/users/me", form);
      updateUser(data.user);
      success("Profile saved successfully.");
    } catch (err) {
      toastError(err.response?.data?.message || "Could not save profile.");
    } finally { setBusy(false); }
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();

  return (
    <AppShell tabs={[{to:"/profile",label:"Profile"}]}>
      <section className="px-6 md:px-12 py-8 md:py-12 max-w-3xl">

        {/* Profile header */}
        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8 mb-12 md:mb-16">
          <div className="flex items-center gap-6 md:gap-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary-gradient flex items-center justify-center text-2xl font-headline font-bold text-on-primary flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 md:hidden">
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2">Trust Score</p>
              <p className="font-headline text-4xl text-primary">{user?.trustScore ?? 0}</p>
              <div className="mt-1"><TrustBadge score={user?.trustScore ?? 0} /></div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-1">Member Profile</p>
            <h1 className="font-headline text-3xl md:text-4xl text-primary tracking-tight">{user?.name}</h1>
            <p className="text-sm text-on-surface-variant mt-1">{user?.email}</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2">Trust Score</p>
            <p className="font-headline text-5xl text-primary">{user?.trustScore ?? 0}</p>
            <div className="mt-1"><TrustBadge score={user?.trustScore ?? 0} /></div>
          </div>
        </div>

        {/* KYC status banner */}
        {user?.kycStatus === "verified" ? (
          <div className="flex items-center gap-3 p-5 bg-primary-fixed/30 rounded-lg mb-10">
            <Icon name="verified_user" className="text-primary" />
            <div>
              <p className="text-sm font-medium text-primary">Identity verified</p>
              <p className="text-xs text-on-surface-variant">
                Verified via {user.kycMethod?.toUpperCase()} on {new Date(user.kycVerifiedAt).toDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-5 bg-error-container/40 rounded-lg mb-10">
            <div className="flex items-center gap-3">
              <Icon name="warning" className="text-error" />
              <p className="text-sm text-on-error-container">
                {user?.kycStatus === "failed" ? "Identity verification failed." : "Identity not verified."} You cannot join or create circles until verified.
              </p>
            </div>
            <a href="/kyc" className="text-[10px] font-label uppercase tracking-widest text-error font-bold border-b border-error/40 pb-0.5 whitespace-nowrap ml-4">
              Verify now →
            </a>
          </div>
        )}

        {/* Trust score breakdown */}
        <div className="bg-surface-container-low p-8 rounded-lg mb-12">
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-6">How your trust score is calculated</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {[
              { action: "Paid before due date",     pts: "+2 per cycle",   color: "text-primary" },
              { action: "Paid on due date",         pts: "+1 per cycle",   color: "text-primary" },
              { action: "Missed payment (defaulted)", pts: "−3 points",   color: "text-error"   },
              { action: "Completed a full circle",  pts: "+5 bonus",       color: "text-primary" },
            ].map(({ action, pts, color }) => (
              <div key={action} className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                <span className="text-sm text-on-surface-variant">{action}</span>
                <span className={`font-headline text-xl ${color}`}>{pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={submit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div>
              <label className="field-label">Full name</label>
              <input name="name" value={form.name} onChange={onChange} required className="field-input" />
            </div>
            <div>
              <label className="field-label">Phone number</label>
              <input name="phone" value={form.phone} onChange={onChange} className="field-input" placeholder="2348012345678" />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-6 md:mb-8">Bank Details for Payouts</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-8">
              <div>
                <label className="field-label">Bank</label>
                <select name="bankCode" value={form.bankCode} onChange={onChange} className="field-input bg-transparent">
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Account number</label>
                <input name="accountNumber" value={form.accountNumber} onChange={onChange} maxLength={10} className="field-input" placeholder="0123456789" />
              </div>
            </div>
            <div>
              <label className="field-label">Account name</label>
              <input name="accountName" value={form.accountName} onChange={onChange} className="field-input" placeholder="As it appears on your account" />
              <p className="text-xs text-on-surface-variant mt-2">
                Must match your bank account exactly for payouts to succeed.
              </p>
            </div>
          </div>

          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}
