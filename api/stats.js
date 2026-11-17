import { handle } from "./_lib/db.js";

export default handle(600, async (_req, db) => {
  const col = db.collection("videos");
  const [totalVideos, folders] = await Promise.all([
    col.estimatedDocumentCount(),
    col.distinct("folder_path"),
  ]);
  return { totalVideos, totalFolders: folders.length };
});
