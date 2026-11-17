import { useState } from "react";

// shortcut: login hanya di browser — user/password ikut ter-bundle di JS dan all_data.json tetap bisa
// diunduh langsung. Cukup untuk "pintu depan"; upgrade ke login server kalau datanya perlu benar-benar dilindungi.
const USER = import.meta.env.VITE_AUTH_USER;
const PASS = import.meta.env.VITE_AUTH_PASS;
const KEY = "myview-login";

const isLoggedIn = () => {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
};
const logout = () => {
  try { localStorage.removeItem(KEY); } catch { /* storage diblokir */ }
};

function Login({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!USER || !PASS) return setError("VITE_AUTH_USER / VITE_AUTH_PASS belum diisi di .env saat build");
    if (username !== USER || password !== PASS) return setError("Username atau password salah");
    try { localStorage.setItem(KEY, "1"); } catch { /* tetap masuk, tapi tidak diingat */ }
    onSuccess();
  };

  const input = "w-full rounded-xl bg-zinc-800/80 px-4 py-3 text-sm outline-none ring-indigo-500 placeholder:text-zinc-500 focus:ring-2";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-white/5 bg-zinc-900 p-8 shadow-2xl">
        <h1 className="text-center text-2xl font-extrabold tracking-tight">
          <span className="text-indigo-400">▶</span> My<span className="text-indigo-400">View</span>
        </h1>
        <p className="text-center text-sm text-zinc-400">Masuk untuk melihat video</p>
        <input className={input} placeholder="Username" aria-label="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input className={input} type="password" placeholder="Password" aria-label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold hover:bg-indigo-400">Masuk</button>
      </form>
    </div>
  );
}

// Tampilkan halaman login dulu; children (App + unduhan data) baru dimuat setelah masuk
export default function AuthGate({ children }) {
  const [ok, setOk] = useState(isLoggedIn);
  if (!ok) return <Login onSuccess={() => setOk(true)} />;
  return children(() => { logout(); setOk(false); });
}
