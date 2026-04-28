import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AppShell, Icon, StatusBadge } from "../components/layout/index";
import api from "../services/api";

const fmt = (n) => `₦${Number(n).toLocaleString("en-NG")}`;

const TABS = [
  { to: "/dashboard",  label: "Overview" },
  { to: "/analytics",  label: "Analytics" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [groups,  setGroups]  = useState([]);
  const [contribs,setContribs]= useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/groups"), api.get("/contributions/history")])
      .then(([g, c]) => { setGroups(g.data.groups); setContribs(c.data.contributions); })
      .finally(() => setLoading(false));
  }, []);

  const activeGroups  = groups.filter((g) => g.status === "active");
  const totalContrib  = contribs.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);
  const nextContrib   = contribs.find((c) => c.status === "pending");
  const firstName     = user?.name?.split(" ")[0] || "there";

  if (loading) return (
    <AppShell tabs={TABS}>
      <div className="px-12 py-12">
        <div className="h-12 w-64 bg-surface-container rounded animate-pulse mb-4" />
        <div className="grid grid-cols-12 gap-8 mt-12">
          {[1,2,3].map(i => <div key={i} className="col-span-4 h-64 bg-surface-container-low rounded-lg animate-pulse" />)}
        </div>
      </div>
    </AppShell>
  );

  return (
    <AppShell tabs={TABS}>
      <section className="px-12 py-12">

        {/* Hero greeting */}
        <div className="mb-16 max-w-4xl">
          <h1 className="text-6xl font-headline tracking-tight text-primary mb-4">
            Welcome back, {firstName}.
          </h1>
          <p className="text-xl font-body text-on-surface-variant leading-relaxed italic opacity-80">
            {activeGroups.length > 0
              ? `You're active in ${activeGroups.length} savings circle${activeGroups.length > 1 ? "s" : ""}. Keep the momentum going.`
              : "You have no active circles yet. Create or join one to get started."}
          </p>
        </div>

        {/* KYC warning banner */}
        {user?.kycStatus !== "verified" && (
          <div className="flex items-center justify-between p-5 bg-error-container/40 border border-error/10 rounded-lg mb-10">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-error flex-shrink-0">verified_user</span>
              <div>
                <p className="text-sm font-medium text-on-error-container">Identity verification required</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {user?.kycStatus === "failed"
                    ? "Your previous verification attempt failed. Please try again."
                    : "Verify your BVN or NIN to join and create savings circles."}
                </p>
              </div>
            </div>
            <Link to="/kyc"
              className="text-[10px] font-label uppercase tracking-widest text-error font-bold border-b border-error/40 pb-0.5 whitespace-nowrap ml-6">
              Verify now →
            </Link>
          </div>
        )}

        {/* Bento stats */}
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-5 bg-surface-container-low p-8 rounded-lg flex flex-col justify-between h-64 border border-outline-variant/10">
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Total Contributed</p>
            <div>
              <h2 className="text-5xl font-headline text-primary">{fmt(totalContrib)}</h2>
              <p className="text-sm text-primary/60 font-body mt-2">Across {contribs.filter(c=>c.status==="paid").length} payments</p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-primary-gradient text-on-primary p-8 rounded-lg flex flex-col justify-between h-64">
            <p className="text-[10px] font-label uppercase tracking-widest opacity-70">
              {nextContrib ? "Next Contribution Due" : "No Pending Contributions"}
            </p>
            <div>
              {nextContrib ? (
                <>
                  <h2 className="text-5xl font-headline">{fmt(nextContrib.amount)}</h2>
                  <div className="mt-4 flex items-center gap-2">
                    <Icon name="event" className="text-sm text-on-primary/70" />
                    <span className="text-xs font-label uppercase tracking-wider opacity-80">
                      Due {new Date(nextContrib.dueDate).toDateString()}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-3xl font-headline opacity-80 italic">All clear</p>
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 bg-surface-container-highest p-8 rounded-lg flex flex-col justify-between h-64">
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Active Circles</p>
            <div className="text-center">
              <span className="text-7xl font-headline text-primary">{activeGroups.length}</span>
              <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant mt-2">Groups</p>
            </div>
            <div className="w-full bg-outline-variant/30 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${Math.min((activeGroups.length / 5) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Active groups + upcoming */}
        <div className="grid grid-cols-12 gap-12 mb-16">

          {/* Groups */}
          <div className="col-span-12 lg:col-span-8">
            <div className="flex justify-between items-baseline mb-8">
              <h3 className="text-3xl font-headline text-on-surface">My Active Circles</h3>
              <Link to="/groups" className="text-[10px] font-label uppercase tracking-widest text-primary font-bold border-b border-primary/30 pb-1">
                View All
              </Link>
            </div>
            <div className="space-y-6">
              {activeGroups.length === 0 && (
                <div className="card p-10 text-center">
                  <p className="font-headline italic text-2xl text-on-surface-variant mb-4">No active circles yet.</p>
                  <Link to="/groups/new" className="btn-primary inline-flex items-center gap-2">
                    <Icon name="add" /> Create a Circle
                  </Link>
                </div>
              )}
              {activeGroups.slice(0, 3).map((g) => (
                <div key={g._id} className="card p-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h4 className="text-2xl font-headline text-primary mb-2">{g.name}</h4>
                      <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant">
                        {fmt(g.contributionAmount)} / {g.frequency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2">Members</p>
                      <div className="flex -space-x-2">
                        {g.members.slice(0, 4).map((m, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-on-primary-fixed">
                            {m.userId?.name?.[0] || "?"}
                          </div>
                        ))}
                        {g.members.length > 4 && (
                          <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                            {g.members.length - 4}+
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-2/3">
                      <p className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant mb-3">
                        Cycle {g.currentCycle} of {g.turnOrder?.length || g.maxMembers}
                      </p>
                      <div className="h-1 bg-surface-container w-full rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(g.currentCycle / (g.turnOrder?.length || g.maxMembers)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {(g.adminId?._id === user?._id || g.adminId === user?._id) && (
                        <Link to={`/groups/${g._id}/admin`}
                          className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
                          Admin →
                        </Link>
                      )}
                      <Link to={`/groups/${g._id}`} className="text-[10px] font-label uppercase tracking-widest text-primary font-bold hover:underline">
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming contributions — Growth Ledger */}
          <div className="col-span-12 lg:col-span-4">
            <h3 className="text-3xl font-headline text-on-surface mb-8">Upcoming</h3>
            <div className="bg-surface-container-low p-8 rounded-lg">
              <div className="space-y-8">
                {contribs.filter(c => c.status === "pending").slice(0, 5).map((c) => (
                  <div key={c._id} className="growth-ledger-row">
                    <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                      {new Date(c.dueDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                    </span>
                    <span className="font-body text-sm font-medium truncate">{c.groupId?.name}</span>
                    <span className="font-headline text-xl text-primary font-bold">{fmt(c.amount)}</span>
                  </div>
                ))}
                {contribs.filter(c => c.status === "pending").length === 0 && (
                  <p className="text-sm text-on-surface-variant italic font-headline">No upcoming contributions.</p>
                )}
              </div>
              <div className="mt-10 pt-8 border-t border-outline-variant/20">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Pay on time to maintain your trust score.{" "}
                  <Link to="/groups" className="text-primary font-bold underline decoration-primary/20 underline-offset-4">
                    View circles
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="mb-24">
          <div className="flex justify-between items-baseline mb-10">
            <h3 className="text-3xl font-headline text-on-surface">Recent Activity</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {["Date","Description","Type","Amount"].map((h) => (
                  <th key={h} className={`pb-4 text-[10px] font-label uppercase tracking-widest text-on-surface-variant ${h==="Amount"?"text-right":""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body">
              {contribs.slice(0, 6).map((c) => (
                <tr key={c._id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-6 text-sm text-on-surface-variant">{new Date(c.createdAt).toLocaleDateString("en-NG", {month:"short",day:"numeric",year:"numeric"})}</td>
                  <td className="py-6 font-medium">{c.groupId?.name} — Cycle {c.cycleNumber}</td>
                  <td className="py-6"><StatusBadge status={c.status} /></td>
                  <td className="py-6 text-right font-headline text-xl text-on-surface">{fmt(c.amount)}</td>
                </tr>
              ))}
              {contribs.length === 0 && (
                <tr><td colSpan={4} className="py-12 text-center text-on-surface-variant italic font-headline text-lg">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="px-12 py-10 border-t border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
        <div className="flex items-center gap-4">
          <span className="text-primary font-headline italic text-xl">AjoSave</span>
          <span className="text-[10px] font-label uppercase tracking-widest opacity-40">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-8">
          {["Privacy","Terms","Support"].map(l => (
            <a key={l} href="#" className="text-[10px] font-label uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">{l}</a>
          ))}
        </div>
      </footer>
    </AppShell>
  );
}
