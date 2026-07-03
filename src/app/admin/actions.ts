"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { channels, db, shorts, users, videos } from "@/db";
import {
  type ActionState,
  type EntityKey,
  entityConfigs,
  isEntityKey,
} from "./config";

// NOTE: These mutations are intentionally UNAUTHENTICATED for now, per product
// request ("no auth required"). Server Actions are reachable via direct POST,
// so add auth/authorization here before this ever ships beyond local play.

type Values = Record<string, string | number | Date | null>;

/** Reads + coerces form values according to the entity's field config. */
function coerceValues(entity: EntityKey, formData: FormData): Values {
  const values: Values = {};

  for (const field of entityConfigs[entity].fields) {
    const raw = formData.get(field.name);
    const str = typeof raw === "string" ? raw.trim() : "";

    if (str === "") {
      if (field.required) {
        throw new Error(`${field.label} is required.`);
      }
      // Leave unset so DB defaults apply on insert / value is unchanged on update.
      continue;
    }

    switch (field.type) {
      case "number":
        values[field.name] = Number(str);
        break;
      case "datetime":
        values[field.name] = new Date(str);
        break;
      default:
        values[field.name] = str;
    }
  }

  return values;
}

async function insertRow(entity: EntityKey, values: Values): Promise<void> {
  switch (entity) {
    case "users":
      await db.insert(users).values(values as unknown as typeof users.$inferInsert);
      break;
    case "channels":
      await db.insert(channels).values(values as typeof channels.$inferInsert);
      break;
    case "videos":
      await db.insert(videos).values(values as typeof videos.$inferInsert);
      break;
    case "shorts":
      await db.insert(shorts).values(values as typeof shorts.$inferInsert);
      break;
  }
}

async function updateRowById(
  entity: EntityKey,
  id: string,
  values: Values,
): Promise<void> {
  const patch = { ...values, updatedAt: new Date() };
  switch (entity) {
    case "users":
      await db.update(users).set(patch).where(eq(users.id, id));
      break;
    case "channels":
      await db.update(channels).set(patch).where(eq(channels.id, id));
      break;
    case "videos":
      await db.update(videos).set(patch).where(eq(videos.id, id));
      break;
    case "shorts":
      await db.update(shorts).set(patch).where(eq(shorts.id, id));
      break;
  }
}

async function deleteRowById(entity: EntityKey, id: string): Promise<void> {
  switch (entity) {
    case "users":
      await db.delete(users).where(eq(users.id, id));
      break;
    case "channels":
      await db.delete(channels).where(eq(channels.id, id));
      break;
    case "videos":
      await db.delete(videos).where(eq(videos.id, id));
      break;
    case "shorts":
      await db.delete(shorts).where(eq(shorts.id, id));
      break;
  }
}

function revalidateEntity(entity: EntityKey): void {
  revalidatePath(`/admin/${entity}`);
  // Public pages read this data too.
  revalidatePath("/", "layout");
}

export async function createRow(
  entity: EntityKey,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isEntityKey(entity)) return { success: false, error: "Unknown entity." };
  try {
    await insertRow(entity, coerceValues(entity, formData));
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
  // On success, revalidate and navigate back to the list. `redirect` throws,
  // so it must run outside the try/catch above.
  revalidateEntity(entity);
  redirect(`/admin/${entity}`);
}

export async function updateRow(
  entity: EntityKey,
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isEntityKey(entity)) return { success: false, error: "Unknown entity." };
  try {
    await updateRowById(entity, id, coerceValues(entity, formData));
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
  revalidateEntity(entity);
  redirect(`/admin/${entity}`);
}

export async function deleteRow(entity: EntityKey, id: string): Promise<void> {
  if (!isEntityKey(entity)) return;
  await deleteRowById(entity, id);
  revalidateEntity(entity);
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}
