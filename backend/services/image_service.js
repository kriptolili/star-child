const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Bir sayfa için illüstrasyon üretir.
 *
 * DÜZELTME — KARAKTER SÜREKLİLİK SORUNU:
 * Önceki hâliyle her sayfa `images.generate()` ile, yalnızca metin
 * prompt'undan, önceki sayfalardan tamamen habersiz üretiliyordu.
 * Prompt'ta ne kadar detaylı "aynı çocuğu koru" talimatı olursa
 * olsun, modelin karakteri her seferinde sıfırdan "hayal etmesi"
 * gerektiği için 7-8. sayfa civarında görsel sapma kaçınılmazdı.
 *
 * Artık ilk sayfadan sonraki her sayfa için, önceki sayfa(lar)ın
 * GERÇEK GÖRSELİ referans olarak `images.edit()` çağrısına
 * ekleniyor. Model artık karakteri "hatırlamıyor", doğrudan
 * görüyor — bu, metin talimatından çok daha güvenilir bir
 * süreklilik sağlar.
 *
 * @param {string} prompt - Sayfaya özel İngilizce görsel prompt'u.
 * @param {string} fileName - Kaydedilecek dosya adı.
 * @param {string[]} [referenceImagePaths] - Süreklilik için referans
 *   alınacak, daha önce üretilmiş sayfa görsellerinin disk yolları.
 *   Boş/verilmemişse (ilk sayfa) düz metinden üretim yapılır.
 */
async function generateIllustration({
  prompt,
  fileName,
  referenceImagePaths = [],
}) {
  const hasReferenceImages =
    Array.isArray(referenceImagePaths) && referenceImagePaths.length > 0;

  let result;

  if (hasReferenceImages) {
    // Referans görselleri OpenAI'nin beklediği dosya akışı (stream)
    // formatına çeviriyoruz.
    const referenceStreams = referenceImagePaths
      .filter((referencePath) => fs.existsSync(referencePath))
      .map((referencePath) => fs.createReadStream(referencePath));

    result = await client.images.edit({
      model: "gpt-image-2",
      image: referenceStreams,
      prompt,
      size: "1024x1536",
      quality: "low",
      output_format: "png",
    });
  } else {
    result = await client.images.generate({
      model: "gpt-image-2",
      prompt,
      size: "1024x1536",
      quality: "low",
      output_format: "png",
    });
  }

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