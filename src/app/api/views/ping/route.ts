import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { recordViewPing } from "@/lib/view-tracking";

export async function POST(request: Request) {
  let body: { videoSlug?: string; viewId?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const videoSlug = body.videoSlug?.trim();
  if (!videoSlug) {
    return NextResponse.json({ error: "videoSlug is required." }, { status: 400 });
  }

  const viewId = body.viewId?.trim() || undefined;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const result = await recordViewPing(videoSlug, viewId, session?.user.id);

  if (!result) {
    return NextResponse.json({ error: "Video or view not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}
