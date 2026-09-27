export type Theme = "light" | "dark";

export const THEME_COOKIE = "mewtube-theme";

export const themeCookieOptions = {
  path: "/",
  // One year, in seconds.
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
} as const;

export function parseTheme(value: string | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}
