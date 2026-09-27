"use server";

import { cookies } from "next/headers";
import { THEME_COOKIE, themeCookieOptions, type Theme } from "@/lib/theme";

export async function setTheme(theme: Theme) {
  const store = await cookies();
  store.set(THEME_COOKIE, theme, themeCookieOptions);
}
