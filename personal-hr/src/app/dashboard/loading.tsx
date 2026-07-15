export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="flex gap-2">
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card bg-base-100 border border-base-200 shadow-sm p-5">
            <div className="skeleton h-4 w-20 mb-3 rounded" />
            <div className="skeleton h-8 w-16 rounded" />
          </div>
        ))}
      </div>
      <div className="card bg-base-100 border border-base-200 shadow-sm p-6">
        <div className="skeleton h-4 w-32 mb-4 rounded" />
        <div className="skeleton h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}
