import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─── Trust Score Badge ────────────────────────────────────────────────────────
export const TrustBadge = ({ score }) => {
  if (score >= 80)  return <span className="trust-excellent">Excellent</span>;
  if (score >= 50)  return <span className="trust-good">Good</span>;
  if (score >= 20)  return <span className="trust-fair">Fair</span>;
  if (score >= 0)   return <span className="trust-new">New</span>;
  return <span className="trust-at-risk">At Risk</span>;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = { paid: "badge-paid", pending: "badge-pending", defaulted: "badge-defaulted" };
  return <span className={map[status] || "badge-pending"}>{status}</span>;
};

// ─── Icon ─────────────────────────────────────────────────────────────────────
export const Icon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { to: "/dashboard",    icon: "dashboard",    label: "Dashboard" },
  { to: "/analytics",    icon: "insights",     label: "Analytics" },
  { to: "/groups",       icon: "group",        label: "Circles" },
  { to: "/transactions", icon: "receipt_long", label: "Transactions" },
  { to: "/profile",      icon: "person",       label: "Profile" },
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col p-8 bg-surface z-50">
        {/* Brand */}
        <div className="mb-12">
          <h1 className="font-headline italic text-2xl tracking-tight text-primary-container">
            AjoSave
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 mt-1">
            The Financial Atelier
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col space-y-1 flex-1">
          {NAV.map(({ to, icon, label }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-label transition-all duration-150 ${
                  active
                    ? "text-primary-container font-bold border-r-4 border-primary-container bg-surface-container-low"
                    : "text-on-surface/60 hover:bg-surface-container-low rounded"
                }`}
              >
                <Icon name={icon} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* KYC warning */}
        {user && user.kycStatus !== "verified" && (
          <Link to="/kyc" className="flex items-center gap-2 px-4 py-3 bg-error-container/40 rounded text-xs text-on-error-container hover:bg-error-container/60 transition-colors mb-2">
            <Icon name="warning" className="text-sm text-error flex-shrink-0" />
            <span className="font-label">Complete identity verification</span>
          </Link>
        )}

        {/* CTA */}
        <div className="mt-auto pt-8">
          <Link to="/groups/new" className="btn-primary w-full flex items-center justify-center gap-2 mb-8">
            <Icon name="add" />
            New Circle
          </Link>
          <div className="flex items-center gap-3 border-t border-outline-variant/10 pt-6">
            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 truncate">
                <TrustBadge score={user?.trustScore ?? 0} />
              </p>
            </div>
            <button onClick={logout} title="Logout" className="text-on-surface-variant/40 hover:text-error transition-colors min-h-[48px] px-2">
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface/95 backdrop-blur-xl border-t border-outline-variant/10 flex items-center justify-around px-2 z-50 pb-2">
        {NAV.map(({ to, icon, label }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 p-2 min-h-[48px] justify-center transition-all ${
                active ? "text-primary font-bold" : "text-on-surface-variant/60"
              }`}
            >
              <Icon name={icon} className={active ? "text-primary text-xl" : "text-xl"} />
              <span className="text-[10px] font-label mx-auto">{label}</span>
            </Link>
          );
        })}
        <Link to="/groups/new" className="flex flex-col items-center gap-1 p-2 min-h-[48px] justify-center text-on-surface-variant/60">
          <div className="w-8 h-8 rounded-full bg-primary-gradient shadow-sm flex items-center justify-center text-on-primary mt-[-8px]">
            <Icon name="add" className="text-[20px]" />
          </div>
          <span className="text-[10px] font-label mx-auto mt-0.5">Circle</span>
        </Link>
      </nav>
    </>
  );
};

// ─── Top Nav ──────────────────────────────────────────────────────────────────
export const TopNav = ({ tabs = [] }) => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  
  return (
    <header className="glass-nav fixed top-0 left-0 md:left-64 right-0 z-40 flex justify-between items-center px-6 md:px-12 h-16">
      <div className="flex items-center gap-6 md:gap-8 overflow-x-auto hide-scrollbar">
        {tabs.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`text-sm font-label tracking-widest uppercase transition-all whitespace-nowrap min-h-[48px] flex items-center ${
              pathname === to
                ? "text-primary font-bold underline underline-offset-8 decoration-primary/40"
                : "text-on-surface/60 hover:text-primary"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2 md:gap-4 text-on-surface-variant pl-4">
        <button className="hover:text-primary transition-colors min-h-[48px] px-2"><Icon name="notifications" /></button>
        <button className="hover:text-primary transition-colors min-h-[48px] px-2"><Icon name="help_outline" /></button>
        <button onClick={logout} title="Logout" className="md:hidden hover:text-error transition-colors min-h-[48px] px-2">
          <Icon name="logout" />
        </button>
      </div>
    </header>
  );
};

// ─── App Shell ────────────────────────────────────────────────────────────────
export const AppShell = ({ children, tabs = [] }) => (
  <>
    <Sidebar />
    <TopNav tabs={tabs} />
    <main className="ml-0 md:ml-64 pt-16 pb-24 md:pb-0 min-h-screen bg-background">
      {children}
    </main>
  </>
);

// ─── Protected Route ──────────────────────────────────────────────────────────
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="font-headline italic text-3xl text-primary animate-pulse">AjoSave</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};
