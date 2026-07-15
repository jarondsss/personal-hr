export default function EmployeeEditLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="skeleton h-5 w-24 rounded" />
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="card bg-base-100 border border-base-200 shadow-xl">
        <div className="card-body flex flex-col gap-4">
          <div className="skeleton h-5 w-36 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <div className="skeleton h-10 w-20 rounded-full" />
            <div className="skeleton h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
