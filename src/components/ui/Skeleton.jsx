// Reusable skeleton shimmer components for loading states
export const Skeleton = ({ className = "" }) => (
  <div className={`bg-surface-container rounded animate-pulse ${className}`} />
);

export const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
      />
    ))}
  </div>
);

// Full Group Detail skeleton — matches the actual layout
export const GroupDetailSkeleton = () => (
  <div className="px-6 md:px-12 py-8 md:py-12">
    {/* Header */}
    <Skeleton className="h-3 w-20 mb-6" />
    <div className="flex flex-col md:flex-row justify-between items-start mb-12 md:mb-16 gap-6 md:gap-0">
      <div className="space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-12 w-80" />
      </div>
      <div className="text-left md:text-right space-y-2">
        <Skeleton className="h-3 w-24 md:ml-auto" />
        <Skeleton className="h-10 w-32 ml-auto" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
      {/* Left col */}
      <div className="col-span-1 lg:col-span-8 space-y-8">
        {/* Cycle card */}
        <div className="card p-10">
          <div className="flex justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-3 w-20 ml-auto" />
              <Skeleton className="h-8 w-36 ml-auto" />
            </div>
          </div>
          <div className="flex justify-between mb-3">
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="mt-8 pt-8 border-t border-outline-variant/20 flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-3 w-24 ml-auto" />
              <Skeleton className="h-8 w-32 ml-auto" />
            </div>
          </div>
        </div>

        {/* Member status card */}
        <div className="card p-10">
          <Skeleton className="h-7 w-44 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right col */}
      <div className="col-span-1 lg:col-span-4 space-y-8">
        <div className="bg-surface-container-low p-8 rounded-lg">
          <Skeleton className="h-3 w-28 mb-6" />
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-lg">
          <Skeleton className="h-3 w-32 mb-6" />
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="growth-ledger-row">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Transactions empty state — contextual messaging per filter
export const TransactionsEmptyState = ({ filter, loading }) => {
  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-6 py-4 border-b border-outline-variant/10">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 ml-auto" />
        </div>
      ))}
    </div>
  );

  const messages = {
    all:       { icon: "receipt_long", title: "No transactions yet.",         sub: "Your payment history will appear here once you join and contribute to a savings circle." },
    paid:      { icon: "check_circle", title: "No paid contributions.",       sub: "Payments you complete will show up here." },
    pending:   { icon: "pending",      title: "No pending contributions.",    sub: "You're all caught up — no outstanding payments right now." },
    defaulted: { icon: "warning",      title: "No defaulted contributions.",  sub: "Great news — you've never missed a payment deadline." },
  };

  const { icon, title, sub } = messages[filter] || messages.all;

  return (
    <div className="py-24 text-center">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-6 block">{icon}</span>
      <p className="font-headline italic text-2xl text-on-surface-variant mb-3">{title}</p>
      <p className="text-sm text-on-surface-variant/60 max-w-sm mx-auto">{sub}</p>
    </div>
  );
};
