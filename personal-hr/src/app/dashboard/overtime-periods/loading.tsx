export default function Loading() {
  return (
    <div className="stack-lg">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-64 bg-base-300 animate-pulse rounded"></div>
          <div className="h-4 w-96 bg-base-300 animate-pulse rounded mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-base-300 animate-pulse rounded"></div>
      </div>

      <div className="overflow-x-auto">
        <div className="h-64 bg-base-300 animate-pulse rounded"></div>
      </div>
    </div>
  )
}
