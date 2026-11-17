import { useState } from "react";
import { Link } from "react-router";

export function Thumb({ src, alt, className = "", aspect = "aspect-[9/16]" }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src)
    return (
      <div className={`flex ${aspect} items-center justify-center bg-zinc-800 text-zinc-600 ${className}`}>
        <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" />
        </svg>
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`${aspect} w-full bg-zinc-800 object-cover ${className}`} />;
}

export function VideoCard({ v }) {
  return (
    <Link to={`/video/${encodeURIComponent(v._id)}`} className="group block overflow-hidden rounded-xl bg-zinc-900 ring-indigo-500 transition hover:-translate-y-0.5 hover:bg-zinc-800 focus-visible:ring-2 outline-none">
      <Thumb src={v.link_image} alt={v.judul} className="transition duration-300 group-hover:scale-105" />
      <div className="p-2.5">
        <p className="line-clamp-2 text-sm font-medium leading-snug">{v.judul}</p>
        <p className="mt-1 truncate text-xs text-zinc-400">{v.folder_path}</p>
      </div>
    </Link>
  );
}

export const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function SkeletonGrid({ n = 12 }) {
  return (
    <div className={GRID}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl bg-zinc-900">
          <div className="aspect-[9/16] bg-zinc-800" />
          <div className="space-y-2 p-2.5"><div className="h-3 rounded bg-zinc-800" /><div className="h-3 w-1/2 rounded bg-zinc-800" /></div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="py-20 text-center">
      <p className="text-red-400">Gagal memuat data: {error?.message}</p>
      <button onClick={onRetry} className="mt-4 rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold hover:bg-indigo-400">Coba lagi</button>
    </div>
  );
}

export const Empty = () => <p className="py-20 text-center text-zinc-500">Tidak ada video</p>;
