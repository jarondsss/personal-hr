export default function DocumentsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="skeleton h-8 w-40 rounded-lg" />
      <div className="card bg-base-100 border border-base-200 shadow-xl">
        <div className="card-body">
          <div className="skeleton h-6 w-40 mb-4 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="skeleton h-24 w-full rounded-lg mb-6" />
          <div className="flex justify-end gap-2">
            <div className="skeleton h-10 w-28 rounded-full" />
            <div className="skeleton h-10 w-36 rounded-full" />
          </div>
        </div>
      </div>
      <div className="card bg-base-100 border border-base-200 shadow-xl">
        <div className="card-body">
          <div className="skeleton h-6 w-44 mb-4 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-base-200">
              <div className="skeleton h-4 w-48 rounded" />
              <div className="skeleton h-7 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
