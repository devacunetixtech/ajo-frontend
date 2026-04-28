import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AppShell, Icon, TrustBadge, StatusBadge } from "../components/layout/index";
import { GroupDetailSkeleton } from "../components/ui/Skeleton";
import { AnnouncementBoard } from "../components/ui/Announcements";
import api from "../services/api";

const fmt = (n) => `₦${Number(n).toLocaleString("en-NG")}`;

// ─── My Groups / Circles ──────────────────────────────────────────────────────
export function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    api.get("/groups").then(r => setGroups(r.data.groups)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get("/groups").then(r => setGroups(r.data.groups)).finally(() => setLoading(false));
  }, []);

  const doJoin = async (e) => {
    e.preventDefault();
    setJoining(true); setJoinError("");
    try {
      const r = await api.post("/groups/join", { inviteCode: joinCode });
      const updated = await api.get("/groups");
      setGroups(updated.data.groups);
      setJoinCode("");
      toastSuccess(`You've joined ${r.data.group?.name || "the circle"}!`);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid code.";
      setJoinError(msg);
      if (err.response?.data?.kycRequired) {
        toastError("Identity verification required before joining a circle.");
      }
    } finally { setJoining(false); }
  };

  const statusColor = { waiting: "text-on-surface-variant", active: "text-primary", completed: "text-secondary" };

  return (
    <AppShell tabs={[{to:"/groups",label:"Circles"},{to:"/groups/new",label:"New Circle"}]}>
      <section className="px-6 md:px-12 py-8 md:py-12">
        <div className="flex justify-between items-baseline mb-12 md:mb-16">
          <div>
            <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">Your Portfolio</p>
            <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight">Savings Circles</h1>
          </div>
          <Link to="/groups/new" className="btn-primary hidden md:flex items-center gap-2">
            <Icon name="add" /> New Circle
          </Link>
        </div>

        {/* Join by code */}
        <div className="bg-surface-container-low p-8 rounded-lg mb-12 max-w-lg">
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-4">Join an existing circle</p>
          <form onSubmit={doJoin} className="flex gap-4 items-end">
            <div className="flex-1">
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter invite code" maxLength={8} className="field-input uppercase tracking-widest text-sm" />
            </div>
            <button type="submit" disabled={joining || !joinCode} className="btn-ghost">
              {joining ? "Joining…" : "Join"}
            </button>
          </form>
          {joinError && <p className="text-xs text-error mt-3">{joinError}</p>}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-56 bg-surface-container-low rounded-lg animate-pulse" />)}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-headline italic text-3xl text-on-surface-variant mb-6">No circles yet.</p>
            <Link to="/groups/new" className="btn-primary inline-flex items-center gap-2">
              <Icon name="add" /> Create your first circle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((g) => (
              <Link key={g._id} to={`/groups/${g._id}`} className="card p-10 block hover:shadow-lift transition-all">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-headline text-primary mb-2">{g.name}</h3>
                    <p className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant">
                      {fmt(g.contributionAmount)} · {g.frequency}
                    </p>
                  </div>
                  <span className={`text-[10px] font-label uppercase tracking-widest ${statusColor[g.status]}`}>
                    {g.status}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">
                      {g.members.length} / {g.maxMembers} members
                    </p>
                    <div className="flex -space-x-1">
                      {g.members.slice(0, 6).map((m, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-primary-fixed border border-surface-container-lowest flex items-center justify-center text-[9px] font-bold text-on-primary-fixed">
                          {m.userId?.name?.[0] || "?"}
                        </div>
                      ))}
                    </div>
                  </div>
                  {g.status === "active" && (
                    <div>
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Cycle</p>
                      <p className="font-headline text-2xl text-primary">{g.currentCycle}<span className="text-sm italic">/{g.turnOrder?.length}</span></p>
                    </div>
                  )}
                </div>
                {g.status === "active" && (
                  <div className="mt-6">
                    <div className="h-0.5 bg-surface-container w-full rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(g.currentCycle / (g.turnOrder?.length || 1)) * 100}%` }} />
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

// ─── Create Group ─────────────────────────────────────────────────────────────
export function CreateGroupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", contributionAmount: "", frequency: "monthly", maxMembers: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const nextStep = (e) => {
    e.preventDefault();
    if (!form.name || !form.contributionAmount || !form.maxMembers) {
      return setError("All fields are required.");
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const { data } = await api.post("/groups", form);
      navigate(`/groups/${data.group._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create group.");
    } finally { setBusy(false); }
  };

  const freqOptions = [
    { value: "weekly",   label: "Weekly",     sub: "Every 7 days" },
    { value: "biweekly", label: "Bi-weekly",  sub: "Every 14 days" },
    { value: "monthly",  label: "Monthly",    sub: "Once a month" },
  ];

  return (
    <AppShell>
      <div className="pt-16 pb-20 px-6 max-w-2xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6 pt-6 md:pt-12">
          <span className={`text-[10px] font-label uppercase tracking-[0.2em] ${step === 1 ? "text-primary font-bold" : "text-on-surface-variant/60"}`}>Step 01</span>
          <div className="h-px w-10 bg-outline-variant opacity-20" />
          <span className={`text-[10px] font-label uppercase tracking-[0.2em] ${step === 2 ? "text-primary font-bold" : "text-on-surface-variant/60"}`}>Step 02</span>
        </div>

        <h1 className="font-headline text-4xl md:text-5xl text-primary tracking-tight mb-3">
          {step === 1 ? "Configure circle." : "Review details."}
        </h1>
        <p className="text-on-surface-variant font-body leading-relaxed mb-16 max-w-sm">
          {step === 1 
            ? "Define the structure of your savings circle. These settings cannot be modified after the circle is created."
            : "Review your configuration. Every detail, from the amount to the frequency, is final once created."
          }
        </p>

        {error && <div className="mb-8 p-4 bg-error-container rounded text-sm text-on-error-container">{error}</div>}

        {step === 1 ? (
          <form onSubmit={nextStep} className="space-y-12">
            <div>
              <label className="field-label">Circle name</label>
              <input name="name" value={form.name} onChange={onChange} required className="field-input text-xl" placeholder="e.g. Heritage Wealth Circle" />
            </div>

            <div>
              <label className="field-label">Contribution amount (₦)</label>
              <input name="contributionAmount" type="number" min="100" value={form.contributionAmount} onChange={onChange} required className="field-input text-xl" placeholder="50,000" />
            </div>

            <div>
              <label className="field-label">Frequency</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                {freqOptions.map(({ value, label, sub }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, frequency: value }))}
                    className={`p-5 rounded-lg border text-left transition-all ${
                      form.frequency === value
                        ? "border-primary bg-primary-fixed/20"
                        : "border-outline-variant/30 hover:border-outline-variant"
                    }`}
                  >
                    <p className="font-body text-sm font-semibold text-on-surface">{label}</p>
                    <p className="text-[10px] font-label uppercase tracking-wide text-on-surface-variant mt-1">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Maximum members</label>
              <input name="maxMembers" type="number" min="2" max="50" value={form.maxMembers} onChange={onChange} required className="field-input text-xl" placeholder="10" />
              <p className="text-xs text-on-surface-variant mt-2">Cycle repeats until everyone gets a payout. Min 2, max 50.</p>
            </div>

            <button type="submit" className="btn-primary w-full">
              Next: Review Circle →
            </button>
          </form>
        ) : (
          <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-surface-container-low p-10 rounded-lg border border-outline-variant/10 space-y-10">
              <div className="flex justify-between items-end border-b border-outline-variant/10 pb-8">
                <div>
                  <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Circle Name</p>
                  <p className="font-headline text-3xl text-primary">{form.name}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Frequency</p>
                   <p className="font-headline text-2xl text-on-surface capitalize">{form.frequency}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <div>
                  <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Member Contribution</p>
                  <p className="font-headline text-3xl text-on-surface">{fmt(form.contributionAmount)}</p>
                </div>
                <div>
                   <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Total Pool per Cycle</p>
                   <p className="font-headline text-3xl text-primary">{fmt(form.contributionAmount * form.maxMembers)}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/10">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  This circle will run for <strong>{form.maxMembers} {form.frequency} cycles</strong>. 
                  As the creator, you will automatically be the group administrator.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={submit} disabled={busy} className="btn-primary w-full">
                {busy ? "Finalizing…" : "Confirm & Create Circle →"}
              </button>
              <button onClick={() => setStep(1)} disabled={busy} className="btn-ghost w-full">
                Back to configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ─── Group Detail ─────────────────────────────────────────────────────────────
export function GroupDetailPage() {
  const { id }  = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [group,  setGroup]   = useState(null);
  const [cycleStatus, setCycleStatus] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payoutBusy, setPayoutBusy] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [startBusy, setStartBusy] = useState(false);

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

  const isAdmin = group?.adminId?._id === user?._id || group?.adminId === user?._id;

  const startCycle = async () => {
    setStartBusy(true);
    try { await api.post(`/groups/${id}/start`); toastSuccess("Cycle started! Turn order assigned."); await load(); }
    catch (err) { toastError(err.response?.data?.message || "Could not start cycle."); }
    finally { setStartBusy(false); }
  };

  const initiatePay = async () => {
    try {
      const { data } = await api.post("/contributions/initiate", { groupId: id });
      window.location.href = data.authorizationUrl;
    } catch (err) { toastError(err.response?.data?.message || "Could not initiate payment."); }
  };

  const triggerPayout = async () => {
    setPayoutBusy(true); setPayoutError("");
    try {
      const { data } = await api.post(`/payouts/${id}`);
      toastSuccess(`Payout of ${fmt(data.amount)} sent to ${data.recipient}.`);
      await load();
    }
    catch (err) { const msg = err.response?.data?.message || "Payout failed."; setPayoutError(msg); toastError(msg); }
    finally { setPayoutBusy(false); }
  };

  const myContrib = cycleStatus?.statuses?.find(s => s.userId === user?._id || s.userId?._id === user?._id);
  const recipientIndex = group ? (group.currentCycle - 1) % group.turnOrder?.length : 0;
  const thisRecipient = group?.turnOrder?.[recipientIndex];

  if (loading) return <AppShell><GroupDetailSkeleton /></AppShell>;

  return (
    <AppShell>
      <section className="px-6 md:px-12 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center justify-between mb-6">
            <Link to="/groups" className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 hover:text-primary inline-flex items-center gap-1">
              <Icon name="arrow_back" className="text-sm" /> All Circles
            </Link>
            {isAdmin && (
              <Link to={`/groups/${id}/admin`}
                className="text-[10px] font-label uppercase tracking-widest text-primary font-bold border-b border-primary/30 pb-0.5 inline-flex items-center gap-1">
                <Icon name="admin_panel_settings" className="text-sm" /> Admin View
              </Link>
            )}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start mt-4 gap-6 md:gap-0">
            <div>
              <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">{group.frequency} · {fmt(group.contributionAmount)} per member</p>
              <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight">{group.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Invite Code</p>
              <p className="font-headline text-3xl text-primary tracking-widest">{group.inviteCode}</p>
              <p className="text-xs text-on-surface-variant mt-1">Share with members</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          {/* Left — cycle status */}
          <div className="col-span-12 lg:col-span-8 space-y-10">

            {/* Status card */}
            {group.status === "waiting" && (
              <div className="card p-10">
                <h3 className="font-headline text-2xl text-on-surface mb-4">Waiting for members</h3>
                <p className="text-sm text-on-surface-variant mb-8">
                  {group.members.length} of {group.maxMembers} members have joined.
                  {isAdmin && group.members.length >= 2 && " You can start the cycle whenever you're ready."}
                </p>
                <div className="h-1 bg-surface-container w-full rounded-full overflow-hidden mb-8">
                  <div className="h-full bg-primary transition-all" style={{ width: `${(group.members.length / group.maxMembers) * 100}%` }} />
                </div>
                {isAdmin && group.members.length >= 2 && (
                  <button onClick={startCycle} disabled={startBusy} className="btn-primary">
                    {startBusy ? "Starting…" : "Start Cycle →"}
                  </button>
                )}
              </div>
            )}

            {group.status === "active" && cycleStatus && (
              <>
                {/* Cycle overview */}
                <div className="card p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Current Cycle</p>
                      <h2 className="font-headline text-4xl text-primary">Cycle {cycleStatus.cycleNumber}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Due Date</p>
                      <p className="font-headline text-2xl text-on-surface">{new Date(cycleStatus.dueDate).toDateString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                      {cycleStatus.paidCount} of {cycleStatus.totalMembers} members paid
                    </p>
                    {cycleStatus.allPaid && (
                      <span className="badge-paid">All paid</span>
                    )}
                  </div>
                  <div className="h-1.5 bg-surface-container w-full rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(cycleStatus.paidCount / cycleStatus.totalMembers) * 100}%` }} />
                  </div>

                  {/* This cycle's recipient */}
                  {thisRecipient && (
                    <div className="mt-8 pt-8 border-t border-outline-variant/20 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">This cycle's recipient</p>
                        <p className="font-headline text-xl text-primary">{thisRecipient.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Pool amount</p>
                        <p className="font-headline text-3xl text-primary">{fmt(group.contributionAmount * group.members.length)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Member payment status — social pressure panel */}
                <div className="card p-10">
                  <h3 className="font-headline text-2xl text-on-surface mb-8">Payment Status</h3>
                  <div className="space-y-4">
                    {cycleStatus.statuses.map((s) => (
                      <div key={s.userId} className="flex items-center justify-between py-4 border-b border-outline-variant/10 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed flex-shrink-0">
                            {s.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-on-surface">{s.name}</p>
                            <TrustBadge score={s.trustScore || 0} />
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={s.status} />
                          {s.paidAt && <p className="text-[10px] text-on-surface-variant mt-1">{new Date(s.paidAt).toDateString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Turn Order display */}
                <div className="card p-10">
                  <h3 className="font-headline text-2xl text-on-surface mb-8">Payout Order</h3>
                  <div className="flex flex-wrap gap-4">
                    {group.turnOrder?.map((member, i) => (
                      <div key={member._id} className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                        group.currentCycle === i + 1 
                          ? "border-primary bg-primary-fixed/20 scale-105 shadow-sm" 
                          : "border-outline-variant/20 opacity-60"
                      }`}>
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-sm font-bold text-on-primary-fixed mb-2">
                          {i + 1}
                        </div>
                        <p className="text-[10px] font-label uppercase tracking-widest text-on-surface font-semibold truncate max-w-[80px]">{member.name.split(" ")[0]}</p>
                        {group.currentCycle === i + 1 && (
                          <p className="text-[8px] font-label uppercase tracking-tighter text-primary mt-1">Receiving Now</p>
                        )}
                        {group.currentCycle > i + 1 && (
                          <Icon name="check_circle" className="text-primary text-xs mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-6 italic">The order was randomized at the start of the cycle to ensure fairness.</p>
                </div>

                {/* Member: Pay button */}
                {myContrib && myContrib.status === "pending" && (
                  <div className="card p-10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-headline text-2xl text-on-surface mb-1">Your contribution</h3>
                        <p className="text-sm text-on-surface-variant">Due {new Date(cycleStatus.dueDate).toDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-headline text-4xl text-primary mb-4">{fmt(group.contributionAmount)}</p>
                        <button onClick={initiatePay} className="btn-primary flex items-center gap-2">
                          <Icon name="payment" /> Pay Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {myContrib?.status === "paid" && (
                  <div className="card p-8 flex items-center gap-4">
                    <Icon name="check_circle" className="text-primary text-3xl" />
                    <div>
                      <p className="font-headline text-xl text-on-surface">You've paid for this cycle.</p>
                      <p className="text-sm text-on-surface-variant">Paid {new Date(myContrib.paidAt).toDateString()}</p>
                    </div>
                  </div>
                )}

                {/* Admin payout button */}
                {isAdmin && (
                  <div className="card p-10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-headline text-2xl text-on-surface mb-2">Release Payout</h3>
                        <p className="text-sm text-on-surface-variant">
                          {cycleStatus.allPaid ? "All members have paid. Ready to release." : `Waiting for ${cycleStatus.totalMembers - cycleStatus.paidCount} more payment(s).`}
                        </p>
                        {payoutError && <p className="text-sm text-error mt-2">{payoutError}</p>}
                      </div>
                      <button
                        onClick={triggerPayout}
                        disabled={!cycleStatus.allPaid || payoutBusy}
                        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {payoutBusy ? "Processing…" : `Send ${fmt(group.contributionAmount * group.members.length)} →`}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {group.status === "completed" && (
              <div className="card p-10 text-center">
                <Icon name="celebration" className="text-5xl text-primary mb-4" />
                <h3 className="font-headline text-3xl text-primary mb-3">Circle Complete!</h3>
                <p className="text-on-surface-variant">All cycles have been completed. Everyone received their payout.</p>
              </div>
            )}
          </div>

          {/* Right — members + payout history */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Members */}
            <div className="bg-surface-container-low p-8 rounded-lg">
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-6">Members ({group.members.length}/{group.maxMembers})</p>
              <div className="space-y-4">
                {group.members.map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed">
                        {m.userId?.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{m.userId?.name}</p>
                        {group.adminId?._id === m.userId?._id && (
                          <p className="text-[10px] text-on-surface-variant">Admin</p>
                        )}
                      </div>
                    </div>
                    <TrustBadge score={m.userId?.trustScore ?? 0} />
                  </div>
                ))}
              </div>
            </div>

            {/* Announcement Board */}
            <AnnouncementBoard groupId={id} isAdmin={isAdmin} />

            {/* Payout history */}
            <div className="bg-surface-container-low p-8 rounded-lg">
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-6">Payout History</p>
              {payouts.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic font-headline">No payouts yet.</p>
              ) : (
                <div className="space-y-4">
                  {payouts.map((p) => (
                    <div key={p._id} className="growth-ledger-row">
                      <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">C{p.cycleNumber}</span>
                      <span className="text-sm font-medium truncate">{p.recipientId?.name}</span>
                      <span className="font-headline text-lg text-primary">{fmt(p.amount)}</span>
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
}
