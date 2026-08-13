import { CategoryChips } from "@/components/category-chips";
import { ShortsShelf } from "@/components/shorts-shelf";
import { VideoGrid } from "@/components/video-card";
import { categories } from "@/lib/mock-data";

export default function Home() {
  return (
    <>
      <CategoryChips categories={categories} />
      <VideoGrid />
      <ShortsShelf />
    </>
  );
}
