import { handle, PUBLIC_FIELDS } from "../_lib/db.js";

export default handle(60, async (req, db) => {
  const { id } = req.query;
  if (typeof id !== "string" || !/^[\w-]{1,64}$/.test(id)) return { error: "ID tidak valid" };

  const col = db.collection("videos");
  const video = await col.findOne({ _id: id }, { projection: PUBLIC_FIELDS });
  if (!video) return null;
  const related = await col
    .find({ folder_path: video.folder_path, _id: { $ne: id } }, { projection: PUBLIC_FIELDS })
    .sort({ waktu_scraping: -1 })
    .limit(12)
    .toArray();
  return { video, related };
});
