const OpenAI = require("openai");
const {
  STAR_CHILD_SYSTEM_PROMPT,
  buildUserPrompt,
} = require("../prompts/star_child_prompt");
const { STORY_BOOK_SCHEMA } = require("../schemas/story_schema");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function createStoryBookPlan(profile) {
  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: [
      { role: "system", content: STAR_CHILD_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(profile) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "star_child_story_book",
        strict: true,
        schema: STORY_BOOK_SCHEMA,
      },
    },
  });

  const rawText = response.output_text?.trim();

  if (!rawText) {
    throw new Error("OpenAI boş yanıt döndürdü.");
  }

  return JSON.parse(rawText);
}

module.exports = {
  createStoryBookPlan,
};
