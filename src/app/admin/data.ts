import { desc, eq } from "drizzle-orm";

import { channels, db, shorts, users, videos } from "@/db";
import {
  type EntityKey,
  type SelectOption,
  entityConfigs,
} from "./config";

export const PAGE_SIZE = 10;

export type AdminRow = Record<string, unknown> & { id: string };

/** A page of rows for an entity, newest first. */
export async function getRows(
  entity: EntityKey,
  { limit, offset }: { limit: number; offset: number },
): Promise<AdminRow[]> {
  switch (entity) {
    case "users":
      return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
    case "channels":
      return db.select().from(channels).orderBy(desc(channels.createdAt)).limit(limit).offset(offset);
    case "videos":
      return db.select().from(videos).orderBy(desc(videos.createdAt)).limit(limit).offset(offset);
    case "shorts":
      return db.select().from(shorts).orderBy(desc(shorts.createdAt)).limit(limit).offset(offset);
  }
}

export async function getCount(entity: EntityKey): Promise<number> {
  switch (entity) {
    case "users":
      return db.$count(users);
    case "channels":
      return db.$count(channels);
    case "videos":
      return db.$count(videos);
    case "shorts":
      return db.$count(shorts);
  }
}

export async function getRowById(
  entity: EntityKey,
  id: string,
): Promise<AdminRow | null> {
  switch (entity) {
    case "users": {
      const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return row ?? null;
    }
    case "channels": {
      const [row] = await db.select().from(channels).where(eq(channels.id, id)).limit(1);
      return row ?? null;
    }
    case "videos": {
      const [row] = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
      return row ?? null;
    }
    case "shorts": {
      const [row] = await db.select().from(shorts).where(eq(shorts.id, id)).limit(1);
      return row ?? null;
    }
  }
}

/** Options for any `select` (foreign-key) fields on the entity. */
export async function getOptions(
  entity: EntityKey,
): Promise<Record<string, SelectOption[]>> {
  const optionsByField: Record<string, SelectOption[]> = {};

  for (const field of entityConfigs[entity].fields) {
    if (field.type !== "select" || !field.optionsFrom) continue;

    if (field.optionsFrom === "users") {
      const rows = await db
        .select({ id: users.id, name: users.name, handle: users.handle })
        .from(users)
        .orderBy(users.name);
      optionsByField[field.name] = rows.map((r) => ({
        value: r.id,
        label: `${r.name} (${r.handle})`,
      }));
    } else if (field.optionsFrom === "channels") {
      const rows = await db
        .select({ id: channels.id, name: channels.name, handle: channels.handle })
        .from(channels)
        .orderBy(channels.name);
      optionsByField[field.name] = rows.map((r) => ({
        value: r.id,
        label: `${r.name} (${r.handle})`,
      }));
    }
  }

  return optionsByField;
}
