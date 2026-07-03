import Link from "next/link";

import { channels, db, shorts, users, videos } from "@/db";
import { entityConfigs, type EntityKey } from "./config";

export const dynamic = "force-dynamic";

async function getCounts(): Promise<Record<EntityKey, number>> {
  const [u, c, v, s] = await Promise.all([
    db.$count(users),
    db.$count(channels),
    db.$count(videos),
    db.$count(shorts),
  ]);
  return { users: u, channels: c, videos: v, shorts: s };
}

export default async function AdminDashboard() {
  const counts = await getCounts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[#606060]">
          Manage the MeowTube catalog. No auth — for local play only.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(entityConfigs) as EntityKey[]).map((key) => (
          <Link
            key={key}
            href={`/admin/${key}`}
            className="flex flex-col gap-1 rounded-xl border border-[#e5e5e5] bg-white p-5 transition-colors hover:border-[#0f0f0f]"
          >
            <span className="text-sm font-medium text-[#606060]">
              {entityConfigs[key].label}
            </span>
            <span className="text-3xl font-bold">{counts[key]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
