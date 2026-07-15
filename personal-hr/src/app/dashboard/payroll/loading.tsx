export default function PayrollLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <div className="skeleton h-10 w-32 rounded-lg" />
          <div className="skeleton h-10 w-24 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-10 w-32 rounded-full" />
          <div className="skeleton h-10 w-36 rounded-full" />
        </div>
      </div>
      <div className="card bg-base-100 border border-base-200 shadow-xl">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, col) => (
              <div key={col} className="overflow-x-auto">
                <div className="grid grid-cols-4 gap-4 px-3 py-3 bg-base-200 rounded-t-lg">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-4 rounded" />
                  ))}
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 px-3 py-3 border-b border-base-200">
                    <div>
                      <div className="skeleton h-4 w-24 rounded mb-1" />
                      <div className="skeleton h-3 w-16 rounded" />
                    </div>
                    <div className="skeleton h-4 w-20 rounded" />
                    <div className="skeleton h-5 w-14 rounded-full" />
                    <div className="skeleton h-7 w-7 rounded" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
