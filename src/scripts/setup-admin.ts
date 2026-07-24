import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import { auth } from "@/lib/auth";

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || process.env.ADMIN_EMAIL || "mikhail.sychev.bytebytego@gmail.com";
  const password = args[1] || process.env.ADMIN_PASSWORD || "mew-admin";
  const name = args[2] || process.env.ADMIN_NAME || "Mikhail Sychev";

  console.log(`Checking user with email: ${email}`);

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUsers.length === 0) {
    console.log("User not found. Creating user via auth.api.signUpEmail...");
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
    console.log("SignUp response:", res);

    await db
      .update(users)
      .set({ isAdmin: true, emailVerified: true })
      .where(eq(users.email, email));
    console.log("Updated user to isAdmin = true and emailVerified = true.");
  } else {
    const user = existingUsers[0];
    console.log("Found existing user:", user.id, user.name);

    // Make sure user is admin
    await db
      .update(users)
      .set({ isAdmin: true, emailVerified: true })
      .where(eq(users.id, user.id));
    console.log("Updated user to isAdmin = true and emailVerified = true.");

    // Check existing account
    const existingAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id));

    console.log("Existing accounts count:", existingAccounts.length);

    // Try setting password or deleting old account and re-creating via signUp/setPassword
    // Let's check auth.api capabilities or better-auth crypto
    try {
      // Better auth supports password update or we can hash password using better-auth password utility
      const { hashPassword } = await import("better-auth/crypto");
      const hashedPassword = await hashPassword(password);

      if (existingAccounts.length > 0) {
        await db
          .update(accounts)
          .set({ password: hashedPassword, updatedAt: new Date() })
          .where(eq(accounts.userId, user.id));
        console.log("Updated password in accounts table.");
      } else {
        await db.insert(accounts).values({
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: hashedPassword,
        });
        console.log("Inserted new credential account with password.");
      }
    } catch (err) {
      console.error("Error setting password:", err);
    }
  }

  console.log("Verifying sign-in with better-auth...");
  try {
    const signInRes = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    console.log("Sign in successful!", signInRes.user?.email, "isAdmin:", signInRes.user?.isAdmin);
  } catch (err) {
    console.error("Sign in failed:", err);
  }

  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
