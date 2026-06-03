import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-slate-200/80" />
        <Skeleton className="h-4 w-72 bg-slate-200/50" />
      </div>

      {/* Stats Cards Skeleton (Only visible for dashboard, but fits as generic top row placeholder) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4"
          >
            <Skeleton className="h-12 w-12 rounded-xl bg-slate-200/80" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24 bg-slate-200/60" />
              <Skeleton className="h-6 w-16 bg-slate-200/80" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Table/Content Card Skeleton */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36 bg-slate-200/80" />
          <Skeleton className="h-6 w-20 bg-slate-200/60" />
        </div>
        <div className="space-y-3 pt-4">
          <Skeleton className="h-10 w-full bg-slate-200/80 rounded-md" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center justify-between py-1">
              <Skeleton className="h-6 w-1/4 bg-slate-200/40" />
              <Skeleton className="h-6 w-1/6 bg-slate-200/40" />
              <Skeleton className="h-6 w-1/6 bg-slate-200/40" />
              <Skeleton className="h-6 w-12 bg-slate-200/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
