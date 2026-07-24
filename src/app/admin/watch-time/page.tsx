import { Clock, BarChart3 } from "lucide-react";
import { WatchTimeChart } from "@/components/admin/watch-time-chart";
import {
  getCumulativeDailyWatchTime,
  getTotalWatchTime,
} from "@/lib/admin-queries";
import { formatWatchTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminWatchTimePage() {
  const [totalWatchTimeSeconds, cumulativeDaily] = await Promise.all([
    getTotalWatchTime(),
    getCumulativeDailyWatchTime(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Watch time</h1>
          <p className="text-sm text-muted">
            Track daily platform usage and watch metrics
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <Clock className="size-5 text-muted" />
          <div className="flex flex-col">
            <span className="text-xs text-muted">Total platform watch time</span>
            <span className="text-lg font-bold text-foreground">
              {formatWatchTime(totalWatchTimeSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Cumulative service watch time per day Graph */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-foreground" />
          <h2 className="text-lg font-bold text-foreground">
            Cumulative service watch time per day
          </h2>
        </div>

        <WatchTimeChart data={cumulativeDaily} />
      </section>
    </div>
  );
}
