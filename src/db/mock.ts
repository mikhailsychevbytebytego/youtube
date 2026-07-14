import "dotenv/config";
import { z } from "zod";
import { db } from "./index";
import { channels, users } from "./schema";

const FAL_ENDPOINT = "https://fal.run/openrouter/router";
const MODEL = "google/gemini-3.5-flash";
const DEFAULT_COUNT = 5;

const mockUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  channel: z.object({
    name: z.string().min(1),
    handle: z.string().regex(/^@[a-z0-9_.]{3,30}$/),
    description: z.string().optional(),
    subscriberCount: z.number().int().nonnegative(),
  }),
});

const mockUsersSchema = z.array(mockUserSchema);

type MockUser = z.infer<typeof mockUserSchema>;

function buildPrompt(
  count: number,
  takenEmails: string[],
  takenHandles: string[],
): string {
  return [
    `Generate exactly ${count} fake users for "MewTube", a YouTube-style site dedicated to cat videos.`,
    "Each user owns one channel with a cat-themed name, handle, short description, and a plausible subscriber count.",
    "",
    "Respond with ONLY a JSON array (no prose, no markdown fences) where each element matches:",
    "{",
    '  "name": "Willow Nightpaw",',
    '  "email": "willow@mewtube.test",',
    '  "channel": {',
    '    "name": "Midnight Zoomies",',
    '    "handle": "@midnightzoomies",',
    '    "description": "Chaotic 3am cat energy, daily.",',
    '    "subscriberCount": 48200',
    "  }",
    "}",
    "",
    "Rules:",
    '- email must end in "@mewtube.test" and be unique within the array',
    "- handle must start with @ followed by 3-30 lowercase letters, digits, underscores, or dots",
    "- subscriberCount is an integer between 100 and 10000000",
    "- descriptions are one short sentence",
    takenEmails.length > 0
      ? `- do NOT use any of these emails: ${takenEmails.join(", ")}`
      : "",
    takenHandles.length > 0
      ? `- do NOT use any of these handles: ${takenHandles.join(", ")}`
      : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return match ? match[1] : trimmed;
}

async function generateMockUsers(count: number): Promise<MockUser[]> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error("FAL_KEY is not set");
  }

  const [existingUsers, existingChannels] = await Promise.all([
    db.select({ email: users.email }).from(users),
    db.select({ handle: channels.handle }).from(channels),
  ]);

  const prompt = buildPrompt(
    count,
    existingUsers.map((u) => u.email),
    existingChannels.map((c) => c.handle),
  );

  console.log(`Asking ${MODEL} for ${count} mock users...`);
  const response = await fetch(FAL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model: MODEL,
      temperature: 1,
      // gemini-3.5-flash is a thinking model; the endpoint rejects requests
      // that try to disable reasoning (the default).
      reasoning: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`fal.ai request failed (${response.status}): ${body}`);
  }

  const result = (await response.json()) as {
    output?: string;
    error?: string;
  };
  if (result.error) {
    throw new Error(`fal.ai returned an error: ${result.error}`);
  }
  if (!result.output) {
    throw new Error("fal.ai response is missing the output field");
  }

  const raw = stripCodeFences(result.output);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    console.error("Model output is not valid JSON:\n", result.output);
    throw error;
  }

  const parsed = mockUsersSchema.safeParse(json);
  if (!parsed.success) {
    console.error("Model output failed validation:\n", result.output);
    console.error(z.prettifyError(parsed.error));
    throw new Error("Generated JSON did not match the expected schema");
  }

  return parsed.data;
}

async function insertMockUsers(mockUsers: MockUser[]): Promise<void> {
  let insertedUsers = 0;
  let insertedChannels = 0;

  for (const mockUser of mockUsers) {
    const [user] = await db
      .insert(users)
      .values({ name: mockUser.name, email: mockUser.email })
      .onConflictDoNothing()
      .returning();

    if (!user) {
      console.log(`Skipped ${mockUser.email} (email already exists)`);
      continue;
    }
    insertedUsers++;

    const [channel] = await db
      .insert(channels)
      .values({
        userId: user.id,
        name: mockUser.channel.name,
        handle: mockUser.channel.handle,
        description: mockUser.channel.description,
        subscriberCount: mockUser.channel.subscriberCount,
      })
      .onConflictDoNothing()
      .returning();

    if (!channel) {
      console.log(
        `Inserted ${mockUser.name}, but skipped channel ${mockUser.channel.handle} (handle already exists)`,
      );
      continue;
    }
    insertedChannels++;

    console.log(
      `Inserted ${mockUser.name} <${mockUser.email}> with channel ${mockUser.channel.handle} (${mockUser.channel.subscriberCount.toLocaleString()} subs)`,
    );
  }

  console.log(
    `Done: ${insertedUsers}/${mockUsers.length} users, ${insertedChannels}/${mockUsers.length} channels inserted.`,
  );
}

async function main() {
  const countArg = process.argv[2];
  const count = countArg ? Number.parseInt(countArg, 10) : DEFAULT_COUNT;
  if (!Number.isInteger(count) || count < 1 || count > 50) {
    throw new Error(
      `Count must be an integer between 1 and 50, got "${countArg}"`,
    );
  }

  const mockUsers = await generateMockUsers(count);
  console.log(`Model returned ${mockUsers.length} users.`);
  await insertMockUsers(mockUsers);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
