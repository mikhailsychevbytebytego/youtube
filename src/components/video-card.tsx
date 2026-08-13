import { CircleCheck, EllipsisVertical } from "lucide-react";
import { Avatar, MediaPlaceholder } from "@/components/media-placeholder";
import { formatViews, formatWatching } from "@/lib/format";
import { getChannel, videos, type Video } from "@/lib/mock-data";

function VideoCard({ video }: { video: Video }) {
  const channel = getChannel(video.channelId);

  return (
    <article className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-xl">
        <MediaPlaceholder
          seed={video.id}
          emoji={video.emoji}
          className="size-full"
          emojiClassName="text-5xl"
        />

        {video.live ? (
          <span className="bg-brand absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[11px] leading-4 font-semibold tracking-wide text-white">
            LIVE
          </span>
        ) : null}

        {video.thumbnailCaption ? (
          <span className="absolute inset-x-3 bottom-3 text-xl leading-tight font-bold text-white drop-shadow-md">
            {video.thumbnailCaption}
          </span>
        ) : null}

        {video.duration ? (
          <span className="absolute right-2 bottom-2 rounded bg-black/80 px-1 py-0.5 text-[11px] leading-4 font-medium text-white">
            {video.duration}
          </span>
        ) : null}
      </div>

      <div className="flex gap-3">
        <Avatar seed={channel.id} emoji={channel.emoji} />

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm leading-5 font-medium">{video.title}</h3>

          <p className="text-muted mt-1 flex items-center gap-1 text-xs">
            <span className="truncate">{channel.name}</span>
            {channel.verified ? (
              <CircleCheck className="size-3.5 shrink-0" aria-label="Verified" />
            ) : null}
          </p>

          {video.live ? (
            <>
              <p className="text-muted text-xs">{formatWatching(video.watching ?? 0)}</p>
              <span className="border-brand text-brand mt-1.5 inline-block rounded border px-1 text-[10px] leading-4 font-semibold tracking-wide">
                LIVE NOW
              </span>
            </>
          ) : (
            <p className="text-muted text-xs">
              {formatViews(video.views ?? 0)} • {video.publishedAt}
            </p>
          )}
        </div>

        <button
          type="button"
          aria-label={`More options for ${video.title}`}
          className="text-muted hover:bg-subtle -mr-1 grid size-8 shrink-0 place-items-center self-start rounded-full transition-colors"
        >
          <EllipsisVertical className="size-4" />
        </button>
      </div>
    </article>
  );
}

export function VideoGrid() {
  return (
    <section aria-label="Recommended videos">
      <ul className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {videos.map((video) => (
          <li key={video.id}>
            <VideoCard video={video} />
          </li>
        ))}
      </ul>
    </section>
  );
}
