import { MongoClient } from "mongodb";

// Cache di globalThis: instance serverless yang "hangat" memakai ulang koneksi yang sama
export async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI belum diset");
  globalThis._mongo ??= new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5 }).connect();
  try {
    return (await globalThis._mongo).db("videodb");
  } catch (e) {
    globalThis._mongo = null; // jangan cache koneksi gagal
    throw e;
  }
}

// Bungkus handler: hanya GET, header cache, error JSON tanpa detail internal
export const handle = (maxAge, fn) => async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const body = await fn(req, await getDb());
    if (body === null) return res.status(404).json({ error: "Tidak ditemukan" });
    if (body.error) return res.status(400).json(body);
    res.setHeader("Cache-Control", `s-maxage=${maxAge}, stale-while-revalidate=300`);
    res.status(200).json(body);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

export const PUBLIC_FIELDS = { halaman_sumber: 0 };
