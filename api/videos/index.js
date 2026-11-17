import { handle, PUBLIC_FIELDS } from "../_lib/db.js";

const int = (v, def) => (v === undefined || v === "" ? def : /^\d+$/.test(v) ? Number(v) : NaN);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default handle(60, async (req, db) => {
  const { q = "", folder = "", sort = "newest" } = req.query;
  const page = int(req.query.page, 1);
  const limit = int(req.query.limit, 30);
  if (typeof q !== "string" || typeof folder !== "string" || q.length > 100 || folder.length > 300)
    return { error: "Parameter q/folder tidak valid" };
  if (!(page >= 1 && page <= 10000)) return { error: "Parameter page tidak valid" };
  if (!(limit >= 1)) return { error: "Parameter limit tidak valid" };
  if (sort !== "newest" && sort !== "title") return { error: "Parameter sort tidak valid" };

  const size = Math.min(limit, 100);
  const filter = {};
  if (folder) filter.folder_path = folder;
  if (q.trim()) filter.judul = { $regex: escapeRegex(q.trim()), $options: "i" };

  const col = db.collection("videos");
  const [items, total] = await Promise.all([
    col
      .find(filter, { projection: PUBLIC_FIELDS })
      .sort(sort === "title" ? { judul: 1, _id: 1 } : { waktu_scraping: -1, _id: 1 })
      .skip((page - 1) * size)
      .limit(size)
      .toArray(),
    col.countDocuments(filter),
  ]);
  return { items, total, page, pages: Math.ceil(total / size) };
});
