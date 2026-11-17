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
  if (!["newest", "title", "random"].includes(sort)) return { error: "Parameter sort tidak valid" };
  const seed = req.query.seed || "0";
  if (typeof seed !== "string" || !/^[a-z0-9]{1,16}$/.test(seed)) return { error: "Parameter seed tidak valid" };

  const size = Math.min(limit, 100);
  const filter = {};
  if (folder) filter.folder_path = folder;
  if (q.trim()) filter.judul = { $regex: escapeRegex(q.trim()), $options: "i" };

  const col = db.collection("videos");
  const skip = (page - 1) * size;
  // random: urutan acak tapi stabil per seed (hash seed+_id), jadi paginasi tidak mengulang video
  const query =
    sort === "random"
      ? col.aggregate([
          { $match: filter },
          { $addFields: { _r: { $toHashedIndexKey: { $concat: [seed, { $toString: "$_id" }] } } } },
          { $sort: { _r: 1, _id: 1 } },
          { $skip: skip },
          { $limit: size },
          { $project: { ...PUBLIC_FIELDS, _r: 0 } },
        ])
      : col
          .find(filter, { projection: PUBLIC_FIELDS })
          .sort(sort === "title" ? { judul: 1, _id: 1 } : { waktu_scraping: -1, _id: 1 })
          .skip(skip)
          .limit(size);
  const [items, total] = await Promise.all([
    query.toArray(),
    col.countDocuments(filter),
  ]);
  return { items, total, page, pages: Math.ceil(total / size) };
});
