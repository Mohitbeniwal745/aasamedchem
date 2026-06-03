import { Skeleton } from '@/components/ui/skeleton'

export default function SellerLoading() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-slate-200/80" />
        <Skeleton className="h-4 w-96 bg-slate-200/50" />
      </div>

      {/* Grid of Product Cards Skeleton (catalogue view) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-2/3 bg-slate-200/80" />
                <Skeleton className="h-5 w-16 bg-slate-200/60 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24 bg-slate-200/40" />
            </div>
            <Skeleton className="h-12 w-full bg-slate-200/30" />
            <div className="pt-2 flex items-center justify-between border-t border-slate-50">
              <Skeleton className="h-6 w-24 bg-slate-200/60" />
              <Skeleton className="h-9 w-20 bg-slate-200/80 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
