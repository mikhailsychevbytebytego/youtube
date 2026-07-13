import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Reuse the client across HMR reloads in dev — otherwise every recompile
// creates a new pool and leaks connections until Supavisor's cap is hit.
const globalForDb = globalThis as unknown as {
  dbClient?: ReturnType<typeof postgres>;
};

// prepare: false is required for the Supavisor transaction pooler (port 6543),
// which does not support prepared statements. Harmless in session mode.
const client =
  globalForDb.dbClient ??
  postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbClient = client;
}

export const db = drizzle(client, { schema });
