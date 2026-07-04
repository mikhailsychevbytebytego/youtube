import { fal } from "@fal-ai/client";
import { eq, sql, desc, notInArray } from "drizzle-orm";
import { channels, db, videos, comments } from "../src/db";

const LLM_MODEL = "fal-ai/any-llm";
const LLM_MODEL_ID = "google/gemini-2.5-flash";

type GeneratedComment = {
  videoId: string;
  text: string;
};

type CommentsPlan = {
  comments: GeneratedComment[];
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || (name === "FAL_KEY" && value === "your_fal_api_key_here")) {
    throw new Error(`${name} is missing. Add it to your .env file.`);
  }
  return value;
}

function parseJsonOutput(raw: string): CommentsPlan {
  const trimmed = raw.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(unfenced);
  } catch {
    throw new Error(`LLM returned invalid JSON: ${raw.slice(0, 200)}`);
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as CommentsPlan).comments)
  ) {
    throw new Error("LLM JSON is missing required 'comments' array field");
  }

  return parsed as CommentsPlan;
}

async function getRecentComments(channelId: string): Promise<string[]> {
  const recent = await db
    .select({ text: comments.text })
    .from(comments)
    .where(eq(comments.channelId, channelId))
    .orderBy(desc(comments.createdAt))
    .limit(10);
  
  return recent.map(c => c.text);
}

async function main() {
  requireEnv("FAL_KEY");
  requireEnv("DATABASE_URL");

  console.log("Picking a random channel...");
  const [channel] = await db
    .select({
      id: channels.id,
      name: channels.name,
      description: channels.description,
    })
    .from(channels)
    .orderBy(sql`random()`)
    .limit(1);

  if (!channel) {
    throw new Error("No channels found in DB.");
  }

  console.log(`Selected channel: ${channel.name}`);

  const recentComments = await getRecentComments(channel.id);
  
  console.log("Finding random videos this channel hasn't commented on...");
  
  // Find videos the channel has already commented on
  const commentedVideoIdsQuery = db
    .select({ videoId: comments.videoId })
    .from(comments)
    .where(eq(comments.channelId, channel.id));
    
  // Find up to 10 random videos
  // We use notInArray on a subquery or do a left join, but since SQLite/pg supports subqueries, we'll just fetch the IDs
  const commentedVideoRows = await commentedVideoIdsQuery;
  const commentedVideoIds = commentedVideoRows.map(row => row.videoId);

  let targetVideosQuery = db
    .select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      channelName: channels.name,
    })
    .from(videos)
    .innerJoin(channels, eq(videos.channelId, channels.id));

  if (commentedVideoIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    targetVideosQuery = targetVideosQuery.where(notInArray(videos.id, commentedVideoIds)) as any;
  }

  const targetVideos = await targetVideosQuery
    .orderBy(sql`random()`)
    .limit(10);

  if (targetVideos.length === 0) {
    console.log("No available videos to comment on for this channel.");
    return;
  }

  console.log(`Found ${targetVideos.length} videos. Generating comments...`);

  const prompt = `You are generating realistic MeowTube (a YouTube clone for cats) comments for a specific channel.
Channel Name: "${channel.name}"
Channel Description: "${channel.description || 'No description provided.'}"

Here are some of their recent comments to help match their style (if empty, invent a fitting style):
${recentComments.length > 0 ? recentComments.map(c => `- "${c}"`).join('\n') : "No recent comments."}

Please generate one comment for each of the following videos. The comment should be relevant to the video title and description, and sound like it was written by the channel owner. Keep comments relatively short, like typical YouTube comments. 

Videos:
${targetVideos.map(v => `ID: ${v.id}
Title: ${v.title}
Channel: ${v.channelName}
Description: ${v.description || 'No description'}
`).join('\n---\n')}

Return ONLY valid JSON in this format:
{
  "comments": [
    {
      "videoId": "the-video-id",
      "text": "the comment text"
    }
  ]
}`;

  const { data } = await fal.subscribe(LLM_MODEL, {
    input: {
      model: LLM_MODEL_ID,
      priority: "latency",
      system_prompt: "You generate MeowTube comments. Respond with ONLY valid JSON.",
      prompt,
    },
  });

  const plan = parseJsonOutput(data.output);

  console.log(`Generated ${plan.comments.length} comments. Inserting...`);

  for (const comment of plan.comments) {
    // Validate videoId exists in our target list
    if (!targetVideos.find(v => v.id === comment.videoId)) {
      console.warn(`Skipping invalid videoId: ${comment.videoId}`);
      continue;
    }
    
    await db.insert(comments).values({
      videoId: comment.videoId,
      channelId: channel.id,
      text: comment.text,
      // random likes between 0 and 500
      likeCount: Math.floor(Math.random() * 500),
    });
    console.log(`Inserted comment on video ${comment.videoId}: "${comment.text}"`);
  }

  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to generate comments:", err);
    process.exit(1);
  });
