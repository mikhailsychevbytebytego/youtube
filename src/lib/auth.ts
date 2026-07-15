import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { accounts, sessions, users, verifications } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    fields: {
      image: "avatarUrl",
    },
    additionalFields: {
      // input: false keeps sign-up from setting the flag; admins grant it
      // through the admin UI instead.
      isAdmin: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
  advanced: {
    database: {
      // All tables use uuid primary keys with defaultRandom(), so let
      // Postgres generate the ids.
      generateId: false,
    },
  },
});
