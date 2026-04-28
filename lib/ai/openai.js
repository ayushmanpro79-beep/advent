import OpenAI from "openai";
import { STAT_KEYS } from "@/lib/game/stats";

let client;

function getOpenAIClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

function parseJson(text) {
  const cleaned = text?.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function requireOpenAI() {
  if (process.env.AI_PROVIDER !== "openai") {
    throw new Error("AI_PROVIDER must be set to openai.");
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }
  if (!process.env.OPENAI_MODEL) {
    throw new Error("OPENAI_MODEL is missing.");
  }
}

async function createJsonResponse({ system, payload }) {
  requireOpenAI();
  const response = await getOpenAIClient().responses.create({
    model: process.env.OPENAI_MODEL,
    input: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(payload) },
    ],
  });
  return parseJson(response.output_text);
}

export async function resolveActionWithAi({ actionText, character, recentMessages, worldBible, roll }) {
  const system =
    "You are the Game Master for Project Advent. Choose exactly one stat from STR, DEX, MA, EN, ACC, INT, CHR for the player action. Return only JSON with keys stat, difficulty, narration, successTone. difficulty must be an integer from 8 to 22. narration must be concise, vivid, and written as the GM.";
  const payload = {
    allowedStats: STAT_KEYS,
    actionText,
    character,
    recentMessages,
    worldBible,
    roll,
  };

  let parsed = await createJsonResponse({ system, payload });
  if (!isValidActionAi(parsed)) {
    parsed = await createJsonResponse({
      system:
        "Repair the previous Game Master output. Return only valid JSON with stat, difficulty, narration, successTone. stat must be one of STR, DEX, MA, EN, ACC, INT, CHR. difficulty must be an integer from 8 to 22.",
      payload: { previousOutput: parsed, originalRequest: payload },
    });
  }

  if (!isValidActionAi(parsed)) {
    throw new Error("OpenAI returned an invalid Game Master response.");
  }

  return {
    stat: parsed.stat,
    difficulty: parsed.difficulty,
    narration: parsed.narration.trim(),
    successTone: parsed.successTone,
  };
}

export async function summarizeWorldBible({ campaign, messages }) {
  const parsed = await createJsonResponse({
    system:
      "Summarize campaign memory for a storytelling game. Return only JSON with summary, people, places, events, openThreads arrays. Use only the provided public story messages.",
    payload: { campaign, messages },
  });

  if (!isValidWorldBible(parsed)) {
    throw new Error("OpenAI returned an invalid World Bible response.");
  }

  return {
    summary: parsed.summary,
    people: parsed.people,
    places: parsed.places,
    events: parsed.events,
    openThreads: parsed.openThreads,
  };
}

function isValidActionAi(value) {
  return Boolean(
    value &&
      STAT_KEYS.includes(value.stat) &&
      Number.isInteger(value.difficulty) &&
      value.difficulty >= 8 &&
      value.difficulty <= 22 &&
      typeof value.narration === "string" &&
      value.narration.trim() &&
      typeof value.successTone === "string" &&
      value.successTone.trim(),
  );
}

function isValidWorldBible(value) {
  return Boolean(
    value &&
      typeof value.summary === "string" &&
      Array.isArray(value.people) &&
      Array.isArray(value.places) &&
      Array.isArray(value.events) &&
      Array.isArray(value.openThreads),
  );
}
