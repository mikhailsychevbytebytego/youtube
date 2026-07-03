import Image from "next/image";
import { SlidersHorizontal, ThumbsDown, ThumbsUp } from "lucide-react";
import { commentCount, comments, viewerAvatar } from "@/lib/watch-data";

export function CommentsSection() {
  return (
    <section className="flex w-full flex-col gap-6 pt-6">
      <div className="flex items-center gap-8">
        <h2 className="text-xl font-bold text-black">{commentCount}</h2>
        <button type="button" className="flex items-center gap-2 text-sm font-medium text-black">
          <SlidersHorizontal className="size-6" />
          Sort by
        </button>
      </div>

      <div className="flex w-full items-center gap-4">
        <Image
          src={viewerAvatar}
          alt="You"
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full object-cover"
        />
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 border-b border-[#e5e5e5] pb-2 text-sm text-black outline-none placeholder:text-[#606060] focus:border-[#0f0f0f]"
        />
      </div>

      <div className="flex w-full flex-col gap-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex w-full gap-4">
            <Image
              src={comment.avatar}
              alt={comment.author}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover"
            />
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-black">{comment.author}</span>
                <span className="text-xs text-[#606060]">{comment.timeAgo}</span>
              </div>
              <p className="text-sm leading-[1.4] text-black">{comment.text}</p>
              <div className="flex items-center gap-4 pt-2">
                <span className="flex items-center gap-1 text-xs text-[#606060]">
                  <ThumbsUp className="size-4" />
                  {comment.likes}
                </span>
                <ThumbsDown className="size-4 text-[#606060]" />
                <button type="button" className="text-xs font-semibold text-black">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
