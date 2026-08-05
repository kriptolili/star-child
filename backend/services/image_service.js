const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateIllustration({ prompt, fileName }) {
  const result = await client.images.generate({
    model: "gpt-image-2",
    prompt,
    size: "1024x1536",
    quality: "low",
    output_format: "png",
  });

  const imageBase64 = result.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error("Görsel verisi alınamadı.");
  }

  const imagesDirectory = path.join(__dirname, "..", "generated", "images");
  fs.mkdirSync(imagesDirectory, { recursive: true });

  const outputPath = path.join(imagesDirectory, fileName);
  fs.writeFileSync(outputPath, Buffer.from(imageBase64, "base64"));

  return outputPath;
}

module.exports = {
  generateIllustration,
};
