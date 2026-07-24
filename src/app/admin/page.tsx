import Image from "next/image";
import Link from "next/link";
import { Clock, Eye, SquarePlay, Tv2, Users } from "lucide-react";
import { getDashboardStats } from "@/lib/admin-queries";
import { formatCount, formatWatchTime, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const content = (
    <div className="flex flex-col gap-3 rounded-xl border border-[#e5e5e5] p-5">
      <div className="flex items-center gap-2 text-[#606060]">
        <Icon className="size-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-3xl font-bold text-[#0f0f0f]">{value}</span>
    </div>
  );
  return href ? (
    <Link href={href} className="hover:opacity-80">
      {content}
    </Link>
  ) : (
    content
  );
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <>
      <h1 className="text-2xl font-bold text-[#0f0f0f]">Dashboard</h1>

      <div className="grid grid-cols-5 gap-4">
        <StatCard
          label="Users"
          value={String(stats.users)}
          icon={Users}
          href="/admin/users"
        />
        <StatCard
          label="Channels"
          value={String(stats.channels)}
          icon={Tv2}
          href="/admin/channels"
        />
        <StatCard
          label="Videos"
          value={String(stats.videos)}
          icon={SquarePlay}
          href="/admin/videos"
        />
        <StatCard
          label="Total views"
          value={formatCount(stats.totalViews)}
          icon={Eye}
        />
        <StatCard
          label="Watch time"
          value={formatWatchTime(stats.totalWatchTimeSeconds)}
          icon={Clock}
          href="/admin/watch-time"
        />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0f0f0f]">Recent videos</h2>
          <Link
            href="/admin/videos"
            className="text-sm font-semibold text-[#065fd4]"
          >
            View all
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-[#e5e5e5] rounded-xl border border-[#e5e5e5]">
          {stats.recentVideos.map((video) => (
            <Link
              key={video.id}
              href={`/admin/videos/${video.id}`}
              className="flex items-center gap-4 p-3 hover:bg-[#f8f8f8]"
            >
              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f2f2f2]">
                {video.thumbnailUrl && (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-[#0f0f0f]">
                  {video.title}
                </span>
                <span className="text-xs text-[#606060]">
                  {video.channel.name} · {formatCount(video.viewCount)} views ·{" "}
                  {timeAgo(video.publishedAt)}
                </span>
              </div>
              <span className="rounded-full bg-[#f2f2f2] px-2.5 py-1 text-xs font-medium text-[#0f0f0f]">
                {video.type}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
