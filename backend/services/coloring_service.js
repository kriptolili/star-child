const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { toFile } = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const COLORING_PAGE_PROMPT = `
Convert this illustration into a black-and-white coloring book page
for children.

Keep the exact same character, pose, composition, and scene layout
as the reference image. Do not change the character design, the
guardian star, or any recurring animal friends.

Style requirements:
- Clean, bold black outlines only.
- No shading, no gradients, no color fill.
- Pure white background.
- Simple, child-friendly line art suitable for crayons or markers.
- Slightly simplified details compared to the original so a child
  can color it easily, but the scene must remain recognizable as
  the same moment from the story.

No text, no letters, no watermark.
`.trim();

async function generateColoringPage({
  colorImagePath,
  fileName,
  outputDirectory,
}) {
  if (!fs.existsSync(colorImagePath)) {
    throw new Error(
      "Boyama sayfası için renkli görsel bulunamadı: " + colorImagePath
    );
  }

  const referenceFile = await toFile(
    fs.createReadStream(colorImagePath),
    path.basename(colorImagePath),
    { type: "image/png" }
  );

  const result = await client.images.edit({
    model: "gpt-image-2",
    image: [referenceFile],
    prompt: COLORING_PAGE_PROMPT,
    size: "1024x1536",
    quality: "low",
    output_format: "png",
  });

  const imageBase64 = result.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error("Boyama sayfası verisi alınamadı.");
  }

  fs.mkdirSync(outputDirectory, { recursive: true });

  const outputPath = path.join(outputDirectory, fileName);
  fs.writeFileSync(outputPath, Buffer.from(imageBase64, "base64"));

  return outputPath;
}

module.exports = {
  generateColoringPage,
};