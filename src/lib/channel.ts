export const CHANNEL_AVATARS = [
  "/images/avatar-user.png",
  "/images/avatar-meowgical.png",
  "/images/avatar-kitten-academy.png",
  "/images/avatar-cattitude-daily.png",
  "/images/avatar-creamy-paws.png",
  "/images/avatar-purrfectlife.png",
] as const;

const HANDLE_BODY_RE = /^[a-z0-9_]{3,30}$/;
const ALLOWED_AVATARS = new Set<string>(CHANNEL_AVATARS);

export function slugifyHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);
}

export function normalizeHandle(raw: string): string | null {
  let value = raw.trim().toLowerCase();
  if (value.startsWith("@")) value = value.slice(1);
  if (!HANDLE_BODY_RE.test(value)) return null;
  return `@${value}`;
}

export function normalizeChannelName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 50) return null;
  return name;
}

export function normalizeDescription(raw: string): string | null {
  const description = raw.trim();
  if (description.length > 500) return null;
  return description || null;
}

export function normalizeAvatarUrl(raw: string): string {
  return ALLOWED_AVATARS.has(raw) ? raw : CHANNEL_AVATARS[0];
}
