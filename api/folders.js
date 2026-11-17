import { handle } from "./_lib/db.js";

export default handle(600, async (_req, db) => {
  const items = await db
    .collection("videos")
    .aggregate([{ $group: { _id: "$folder_path", count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    .toArray();
  return { items: items.map((f) => ({ name: f._id, count: f.count })) };
});
