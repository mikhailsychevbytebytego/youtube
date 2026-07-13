import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { deleteVideo } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/admin/pagination";
import { listVideos } from "@/lib/admin-queries";
import { formatCount, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const { rows, total, pageCount } = await listVideos(page);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0f0f0f]">
          Videos{" "}
          <span className="text-base font-normal text-[#606060]">({total})</span>
        </h1>
        <Link
          href="/admin/videos/new"
          className="flex items-center gap-2 rounded-full bg-[#0f0f0f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#272727]"
        >
          <Plus className="size-4" /> New video
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e5e5e5]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f8f8f8] text-xs font-semibold text-[#606060]">
            <tr>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {rows.map((video) => (
              <tr key={video.id} className="hover:bg-[#f8f8f8]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-16 shrink-0 overflow-hidden rounded-md bg-[#f2f2f2]">
                      {video.thumbnailUrl && (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="max-w-64 truncate font-semibold text-[#0f0f0f]">
                      {video.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#606060]">
                  {video.channel.name}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#f2f2f2] px-2.5 py-1 text-xs font-medium text-[#0f0f0f]">
                    {video.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#606060]">
                  {formatCount(video.viewCount)}
                </td>
                <td className="px-4 py-3">
                  {video.isPublished ? (
                    <span className="text-xs font-medium text-[#0f7d21]">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-[#606060]">
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#606060]">
                  {timeAgo(video.publishedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/videos/${video.id}`}
                      className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[#0f0f0f] hover:bg-[#f2f2f2]"
                    >
                      <Pencil className="size-4" /> Edit
                    </Link>
                    <DeleteButton
                      action={deleteVideo.bind(null, video.id)}
                      message={`Delete video "${video.title}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#606060]">
                  No videos found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pageCount} basePath="/admin/videos" />
    </>
  );
}
