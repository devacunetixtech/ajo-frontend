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
  { to: "/groups",       icon: "group",        label: "Circles" },
  { to: "/transactions", icon: "receipt_long", label: "Transactions" },
  { to: "/profile",      icon: "person",       label: "Profile" },
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col p-8 bg-surface z-50">
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
          <button onClick={logout} title="Logout" className="text-on-surface-variant/40 hover:text-error transition-colors">
            <Icon name="logout" />
          </button>
        </div>
      </div>
    </aside>
  );
};

// ─── Top Nav ──────────────────────────────────────────────────────────────────
export const TopNav = ({ tabs = [] }) => {
  const { pathname } = useLocation();
  return (
    <header className="glass-nav fixed top-0 left-64 right-0 z-40 flex justify-between items-center px-12 h-16">
      <div className="flex items-center gap-8">
        {tabs.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`text-sm font-label tracking-widest uppercase transition-all ${
              pathname === to
                ? "text-primary font-bold underline underline-offset-8 decoration-primary/40"
                : "text-on-surface/60 hover:text-primary"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4 text-on-surface-variant">
        <button className="hover:text-primary transition-colors"><Icon name="notifications" /></button>
        <button className="hover:text-primary transition-colors"><Icon name="help_outline" /></button>
      </div>
    </header>
  );
};

// ─── App Shell ────────────────────────────────────────────────────────────────
export const AppShell = ({ children, tabs = [] }) => (
  <>
    <Sidebar />
    <TopNav tabs={tabs} />
    <main className="ml-64 pt-16 min-h-screen bg-background">
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
