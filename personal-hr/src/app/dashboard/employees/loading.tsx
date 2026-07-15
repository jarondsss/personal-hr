export default function EmployeesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-36 rounded-lg" />
        <div className="flex gap-2">
          <div className="skeleton h-10 w-28 rounded-full" />
          <div className="skeleton h-10 w-32 rounded-full" />
        </div>
      </div>
      <div className="card bg-base-100 border border-base-200 shadow-xl">
        <div className="card-body p-0">
          <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-base-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-4 rounded" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-base-200">
              <div className="flex items-center gap-2">
                <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-5 w-14 rounded-full" />
              <div className="flex gap-1">
                <div className="skeleton h-7 w-7 rounded" />
                <div className="skeleton h-7 w-7 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
