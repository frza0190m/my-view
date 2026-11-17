import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api.js";
import Home from "./pages/Home.jsx";
import VideoPage from "./pages/Video.jsx";

function SearchBar() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const urlQ = pathname === "/" ? params.get("q") || "" : "";
  const [text, setText] = useState(urlQ);
  const [prevQ, setPrevQ] = useState(urlQ);
  if (prevQ !== urlQ) { setPrevQ(urlQ); setText(urlQ); } // ikut berubah saat tombol back browser

  useEffect(() => {
    if (text === urlQ) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(pathname === "/" ? params : undefined);
      text.trim() ? next.set("q", text.trim()) : next.delete("q");
      next.delete("page");
      navigate(`/?${next}`, { replace: pathname === "/" });
    }, 300);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex-1">
      <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cari judul video..." aria-label="Cari judul video" maxLength={100}
        className="w-full rounded-full bg-zinc-800/80 py-2 pl-9 pr-4 text-sm outline-none ring-indigo-500 placeholder:text-zinc-500 focus:ring-2" />
    </div>
  );
}

function Sidebar({ open, onClose }) {
  const [params] = useSearchParams();
  const active = params.get("folder") || "";
  const [filter, setFilter] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["folders"], queryFn: () => api("/api/folders"), staleTime: 600_000 });
  const folders = (data?.items || []).filter((f) => f.name?.toLowerCase().includes(filter.toLowerCase()));
  const link = (name) => {
    const next = new URLSearchParams(params);
    name ? next.set("folder", name) : next.delete("folder");
    next.delete("page");
    return `/?${next}`;
  };
  const item = (on) => `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${on ? "bg-indigo-500/15 text-indigo-300" : "text-zinc-300 hover:bg-zinc-800"}`;

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/5 bg-zinc-950 transition-transform lg:sticky lg:top-[57px] lg:z-0 lg:h-[calc(100vh-57px)] lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-3">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Cari folder..." aria-label="Cari folder"
            className="w-full rounded-lg bg-zinc-800/80 px-3 py-2 text-sm outline-none ring-indigo-500 placeholder:text-zinc-500 focus:ring-2" />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" onClick={onClose}>
          <Link to={link("")} className={item(!active)}>Semua folder</Link>
          {isLoading && Array.from({ length: 8 }, (_, i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-zinc-900" />)}
          {isError && <button onClick={() => refetch()} className="px-3 py-2 text-sm text-red-400">Gagal memuat — coba lagi</button>}
          {folders.map((f) => (
            <Link key={f.name} to={link(f.name)} className={item(f.name === active)} aria-current={f.name === active ? "page" : undefined}>
              <span className="truncate">{f.name}</span>
              <span className="shrink-0 text-xs text-zinc-500">{f.count.toLocaleString("id-ID")}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default function App({ onLogout }) {
  const [drawer, setDrawer] = useState(false);
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: () => api("/api/stats"), staleTime: 600_000 });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 h-[57px] border-b border-white/5 bg-zinc-950/80 backdrop-blur">
        <div className="flex h-full items-center gap-3 px-3 sm:px-6">
          <button onClick={() => setDrawer(true)} className="rounded-lg p-2 hover:bg-zinc-800 lg:hidden" aria-label="Buka daftar folder">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <Link to="/" className="shrink-0 text-xl font-extrabold tracking-tight">
            <span className="text-indigo-400">▶</span> My<span className="text-indigo-400">View</span>
          </Link>
          <SearchBar />
          {stats && <span className="hidden shrink-0 text-sm text-zinc-400 md:block">{stats.totalVideos.toLocaleString("id-ID")} video</span>}
          <button onClick={onLogout} className="shrink-0 rounded-full bg-zinc-800/80 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">Keluar</button>
        </div>
      </header>
      <div className="lg:flex">
        <Sidebar open={drawer} onClose={() => setDrawer(false)} />
        <main className="min-w-0 flex-1 px-3 py-4 sm:px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/video/:id" element={<VideoPage />} />
            <Route path="*" element={<p className="py-20 text-center text-zinc-500">Halaman tidak ditemukan</p>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
