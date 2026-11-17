import { useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../api.js";
import { Empty, ErrorState, GRID, SkeletonGrid, VideoCard } from "../ui.jsx";

// 1 … 4 5 6 … 129 : halaman pertama, terakhir, dan 1 di kiri-kanan halaman aktif
function pageList(page, total) {
  const out = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - page) <= 1) out.push(p);
    else if (out[out.length - 1] !== "…") out.push("…");
  }
  return out;
}

// seed baru tiap kali halaman di-refresh → urutan acak berbeda, tapi tetap sama saat ganti halaman/back
const SEED = Math.random().toString(36).slice(2, 10);
const LIMITS = [12, 24, 30, 48, 60, 100];
const DEFAULTS = { sort: "random", limit: "30", page: "1" };

export default function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const folder = params.get("folder") || "";
  const sort = ["newest", "title"].includes(params.get("sort")) ? params.get("sort") : "random";
  const page = Math.max(1, parseInt(params.get("page"), 10) || 1);
  const limit = LIMITS.includes(Number(params.get("limit"))) ? Number(params.get("limit")) : 30;

  const qs = new URLSearchParams({ q, folder, sort, page, limit, seed: SEED });
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useQuery({
    queryKey: ["videos", q, folder, sort, page, limit],
    queryFn: () => api(`/api/videos?${qs}`),
    placeholderData: keepPreviousData,
  });

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    value && String(value) !== DEFAULTS[key] ? next.set(key, value) : next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const sel = "rounded-full bg-zinc-800/80 px-4 py-2 text-sm outline-none ring-indigo-500 focus:ring-2";
  const btn = "min-w-9 rounded-full px-3 py-1.5 text-sm disabled:opacity-30";

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">
          {data ? `${data.total.toLocaleString("id-ID")} video` : "Memuat…"}
          {folder && <> di <span className="text-zinc-200">{folder}</span></>}
          {q && <> untuk “<span className="text-zinc-200">{q}</span>”</>}
        </p>
        <div className="flex gap-2">
          <select value={sort} onChange={(e) => set("sort", e.target.value)} aria-label="Urutkan" className={sel}>
            <option value="random">Acak</option>
            <option value="newest">Terbaru</option>
            <option value="title">Judul (A–Z)</option>
          </select>
          <select value={limit} onChange={(e) => set("limit", e.target.value)} aria-label="Video per halaman" className={sel}>
            {LIMITS.map((n) => <option key={n} value={n}>{n} / halaman</option>)}
          </select>
        </div>
      </div>

      {isPending ? <SkeletonGrid n={limit > 24 ? 24 : limit} /> : isError ? <ErrorState error={error} onRetry={refetch} /> : !data.items.length ? <Empty /> : (
        <div className={`${GRID} transition-opacity ${isPlaceholderData ? "opacity-50" : ""}`}>
          {data.items.map((v) => <VideoCard key={v._id} v={v} />)}
        </div>
      )}

      {data?.pages > 1 && (
        <nav aria-label="Halaman" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
          <button onClick={() => set("page", page - 1)} disabled={page <= 1} className={btn + " bg-zinc-800 hover:bg-zinc-700"}>Prev</button>
          {pageList(page, data.pages).map((p, i) =>
            p === "…" ? <span key={"e" + i} className="px-1 text-zinc-500">…</span> : (
              <button key={p} onClick={() => set("page", p)} aria-current={p === page ? "page" : undefined}
                className={btn + (p === page ? " bg-indigo-500 font-semibold" : " bg-zinc-800 hover:bg-zinc-700")}>
                {p.toLocaleString("id-ID")}
              </button>
            ),
          )}
          <button onClick={() => set("page", page + 1)} disabled={page >= data.pages} className={btn + " bg-zinc-800 hover:bg-zinc-700"}>Next</button>
        </nav>
      )}
    </>
  );
}
