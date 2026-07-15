import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * Ensures the request comes from a logged-in admin. Redirects to /signin
 * when there is no session and to the home page when the user isn't an
 * admin. The flag is read fresh from the users table so a promotion or
 * demotion applies immediately, not on next login.
 */
export async function requireAdmin(): Promise<User> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/signin");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (!user?.isAdmin) {
    redirect("/");
  }

  return user;
}
