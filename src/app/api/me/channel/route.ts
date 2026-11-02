import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getChannelForUser } from "@/lib/queries";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ channel: null }, { status: 401 });
  }

  const channel = await getChannelForUser(session.user.id);
  if (!channel) {
    return NextResponse.json({ channel: null });
  }

  return NextResponse.json({
    channel: {
      id: channel.id,
      name: channel.name,
      handle: channel.handle,
      avatarUrl: channel.avatarUrl,
    },
  });
}
