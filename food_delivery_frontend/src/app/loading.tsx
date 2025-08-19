export default function Loading() {
  return (
    <main className="container-page py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-52 bg-gray-200 rounded" />
        <div className="h-24 w-full bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-40 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    </main>
  );
}
