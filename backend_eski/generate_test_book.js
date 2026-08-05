require("dotenv").config();

const path = require("path");
const { createStarBook } = require("./services/pdf_service");

async function createFirstBook() {
  try {
    console.log("📖 Mila'nın Yıldız Kitabı hazırlanıyor...");

    const response = await fetch("http://localhost:3000/story", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        childName: "Mila",
        birthDate: "16 Mayıs 2021",
        birthTime: "14:35",
        birthPlace: "İstanbul, Türkiye",
      }),
    });

    const story = await response.json();

    if (!response.ok) {
      throw new Error(story.error || "Masal alınamadı.");
    }

    const outputPath = await createStarBook({
      profile: {
        childName: "Mila",
        birthDate: "16 Mayıs 2021",
        birthTime: "14:35",
        birthPlace: "İstanbul, Türkiye",
      },
      story,
      inspirationStar: "Sirius",
      coverImagePath: path.join(
        __dirname,
        "generated",
        "mila_ilk_yildiz_resmi.png"
      ),
    });

    console.log("✨ Gökyüzünün ilhamı sayfalara dokundu.");
    console.log("✅ Yıldız Kitabın hazır:");
    console.log(outputPath);
  } catch (error) {
    console.error("❌ Yıldız Kitabı oluşturulamadı:");
    console.error(error);
    process.exitCode = 1;
  }
}

createFirstBook();