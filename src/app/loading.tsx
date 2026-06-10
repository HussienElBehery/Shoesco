export default function Loading() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-7xl animate-pulse gap-6 px-5 py-12">
      <div className="h-10 w-48 rounded-full bg-[#181b21]" />
      <div className="h-72 rounded-[2rem] border border-[#2a2e36] bg-[#181b21]" />
      <div className="grid gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <div className="h-64 rounded-[1.75rem] bg-[#181b21]" key={item} />)}
      </div>
    </div>
  );
}
