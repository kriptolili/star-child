require("dotenv").config();

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateFirstIllustration() {
  try {
    console.log("🎨 Mila'nın ilk resmi hazırlanıyor...");

    const prompt = `
Create a warm, magical children's storybook illustration.

Scene:
A cozy, sunlit room in Istanbul during early afternoon.
A stylized little child named Mila is being gently welcomed into the world.
Above her floats her guardian star Narinışık, a tiny golden-blue glowing orb
with a soft luminous tail.

Character style:
Mila must be a universal, stylized children's book character.
Rounded, gentle features.
No specific ethnicity.
Wrapped in a soft pastel blanket.
Tender, safe and joyful atmosphere.

Visual style:
soft watercolor,
hand-painted children's storybook illustration,
pastel colors,
warm golden light,
dreamy,
gentle,
elegant,
magical,
rich paper texture,
no text,
no letters,
no watermark,
portrait book-page composition.
`;

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

    const outputDirectory = path.join(__dirname, "generated");
    fs.mkdirSync(outputDirectory, { recursive: true });

    const outputPath = path.join(
      outputDirectory,
      "mila_ilk_yildiz_resmi.png"
    );

    fs.writeFileSync(
      outputPath,
      Buffer.from(imageBase64, "base64")
    );

    console.log("✅ İlk resim hazır:");
    console.log(outputPath);
  } catch (error) {
    console.error("❌ Görsel oluşturma hatası:");
    console.error(error);
    process.exitCode = 1;
  }
}

generateFirstIllustration();