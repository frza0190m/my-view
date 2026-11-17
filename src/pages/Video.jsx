import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api.js";
import { ErrorState, GRID, SkeletonGrid, Thumb, VideoCard } from "../ui.jsx";

export default function VideoPage() {
  const { id } = useParams();
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["video", id],
    queryFn: () => api(`/api/videos/${encodeURIComponent(id)}`),
  });

  if (isPending)
    return (
      <div className="space-y-6">
        <div className="mx-auto aspect-[9/16] w-full max-w-xs animate-pulse rounded-2xl bg-zinc-900" />
        <SkeletonGrid n={6} />
      </div>
    );
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const { video, related } = data;
  return (
    <div className="space-y-8">
      <article className="mx-auto flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-start">
        <div className="mx-auto w-full max-w-xs shrink-0 overflow-hidden rounded-2xl sm:mx-0">
          <Thumb src={video.link_image} alt={video.judul} />
        </div>
        <div className="min-w-0">
        <h1 className="text-xl font-bold break-words sm:text-2xl">{video.judul}</h1>
        <Link to={`/?${new URLSearchParams({ folder: video.folder_path })}`} className="mt-1 inline-block text-sm text-indigo-400 hover:underline">
          {video.folder_path}
        </Link>
        <div className="mt-4">
          <a href={video.link_video} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold hover:bg-indigo-400">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> Buka Video
          </a>
        </div>
        </div>
      </article>
      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Video terkait</h2>
          <div className={GRID}>{related.map((v) => <VideoCard key={v._id} v={v} />)}</div>
        </section>
      )}
    </div>
  );
}
