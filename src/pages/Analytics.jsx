import { useAuth } from "../context/AuthContext";
import { AppShell, Icon, TrustBadge } from "../components/layout/index";

export default function AnalyticsPage() {
  const { user } = useAuth();
  
  // NGN Currency formatting helper
  const fmt = (num) => new Intl.NumberFormat("en-NG", { 
    style: "currency", 
    currency: "NGN", 
    minimumFractionDigits: 0 
  }).format(num || 0);

  // Default to stellar metrics if user data is missing (for mockup display)
  const trustScore = user?.trustScore ?? 95;

  return (
    <AppShell tabs={[{ to: "/analytics", label: "Analytics" }]}>
      <section className="px-6 md:px-12 py-8 md:py-12">
        
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">Portfolio Overview</p>
          <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-tight">Analytics</h1>
        </div>

        {/* Analytics Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16 max-w-6xl">
          
          {/* Profile Health */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-8 md:p-12 rounded-lg flex flex-col h-auto">
            <div className="flex justify-between items-start mb-10">
              <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Profile Health</p>
              <TrustBadge score={trustScore} />
            </div>
            <div className="mt-auto">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-7xl font-headline text-primary tracking-tight">{trustScore}</span>
                <span className="text-xs text-primary/60 font-body uppercase tracking-widest font-bold">/ 100</span>
              </div>
              <p className="text-sm text-on-surface-variant font-body leading-relaxed md:max-w-[80%]">
                Your reliability ranks in the top <strong className="text-on-surface">10%</strong> of active cooperative members.
              </p>
            </div>
          </div>

          {/* Score History */}
          <div className="bg-surface-container-low p-8 md:p-12 rounded-lg border border-outline-variant/10">
            <h3 className="text-2xl md:text-3xl font-headline text-on-surface mb-8">Score History</h3>
            <div className="space-y-6">
              {[
                { label: "On-time Contributions", value: "+45", color: "text-primary border-l-primary" },
                { label: "Circle Completions",    value: "+10", color: "text-primary border-l-primary" },
                { label: "Missed Deadlines",      value: "0",   color: "text-on-surface-variant border-l-transparent opacity-50" },
                { label: "Early Leader Bonus",    value: "+5",  color: "text-primary border-l-primary" },
              ].map((item, i) => (
                <div key={i} className={`flex justify-between items-center pl-4 border-l-2 py-1 ${item.color}`}>
                  <span className="text-sm font-body flex-1">{item.label}</span>
                  <span className="font-headline text-2xl">{item.value}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-8 border-t border-outline-variant/10">
              <p className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant/60 mb-3">Next Milestone</p>
              <div className="w-full bg-outline-variant/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: "80%" }} />
              </div>
              <p className="text-xs text-on-surface-variant mt-3 italic font-headline">5 points away from Diamond Member tier.</p>
            </div>
          </div>

        </div>
      </section>
    </AppShell>
  );
}
