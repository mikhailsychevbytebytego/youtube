import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { updateVideo } from "@/app/admin/actions";
import { VideoForm } from "@/components/admin/video-form";
import { getAllChannels, getVideo, getVideoWatchTime } from "@/lib/admin-queries";
import { formatWatchTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [video, channels, watchTimeStats] = await Promise.all([
    getVideo(id),
    getAllChannels(),
    getVideoWatchTime(id),
  ]);
  if (!video) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Edit video</h1>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5">
          <Clock className="size-4 text-muted" />
          <div className="flex flex-col">
            <span className="text-xs text-muted">Total watch time</span>
            <span className="text-sm font-bold text-foreground">
              {formatWatchTime(watchTimeStats.totalSeconds)}
            </span>
          </div>
        </div>
      </div>

      <VideoForm
        action={updateVideo.bind(null, video.id)}
        video={video}
        channels={channels}
      />

      {watchTimeStats.daily.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-foreground">
            Daily watch time breakdown
          </h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-hover text-xs font-semibold text-muted">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Watch time</th>
                  <th className="px-4 py-3 text-right">Ping events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {watchTimeStats.daily.map((row) => (
                  <tr key={row.date} className="hover:bg-surface-hover">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatWatchTime(row.totalSeconds)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {row.eventCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
