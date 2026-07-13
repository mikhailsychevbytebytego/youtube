import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  pageCount,
  basePath,
}: {
  page: number;
  pageCount: number;
  basePath: string;
}) {
  const linkClass =
    "flex items-center gap-1 rounded-full border border-[#e5e5e5] px-3 py-1.5 text-sm font-medium text-[#0f0f0f] hover:bg-[#f2f2f2]";
  const disabledClass =
    "flex items-center gap-1 rounded-full border border-[#e5e5e5] px-3 py-1.5 text-sm font-medium text-[#c4c4c4]";

  return (
    <div className="flex items-center justify-between">
      {page > 1 ? (
        <Link href={`${basePath}?page=${page - 1}`} className={linkClass}>
          <ChevronLeft className="size-4" /> Previous
        </Link>
      ) : (
        <span className={disabledClass}>
          <ChevronLeft className="size-4" /> Previous
        </span>
      )}
      <span className="text-sm text-[#606060]">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={`${basePath}?page=${page + 1}`} className={linkClass}>
          Next <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={disabledClass}>
          Next <ChevronRight className="size-4" />
        </span>
      )}
    </div>
  );
}
