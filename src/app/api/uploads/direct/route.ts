import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createDirectUpload,
  isCloudflareConfigured,
} from "@/lib/cloudflare";
import { getChannelForUser } from "@/lib/queries";

const MAX_DURATION_VIDEO = 3600;
const MAX_DURATION_SHORT = 180;

export async function POST(request: Request) {
  if (!isCloudflareConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudflare Stream is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_API_TOKEN.",
      },
      { status: 503 },
    );
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channel = await getChannelForUser(session.user.id);
  if (!channel) {
    return NextResponse.json(
      { error: "Create a channel before uploading." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    title?: unknown;
    type?: unknown;
  } | null;
  const type = body?.type === "short" ? "short" : "video";
  const title =
    typeof body?.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 100)
      : "Untitled upload";

  try {
    const { uid, uploadURL } = await createDirectUpload({
      maxDurationSeconds:
        type === "short" ? MAX_DURATION_SHORT : MAX_DURATION_VIDEO,
      meta: {
        name: title,
        userId: session.user.id,
        channelId: channel.id,
        type,
      },
    });
    return NextResponse.json({ uid, uploadURL });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start the upload.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
