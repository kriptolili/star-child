require("dotenv").config();

const fs = require("fs");
const path = require("path");

async function testSpeech() {
  try {
    const storyPath = path.join(
      __dirname,
      "generated",
      "premium",
      "Mila",
      "story.json"
    );

    const story = JSON.parse(
      fs.readFileSync(storyPath, "utf8")
    );

    const response = await fetch(
      "http://localhost:3000/speech",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: {
            childName: "Mila",
            storyLanguage: "tr",
            voiceEnabled: true,
          },
          story,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Seslendirme oluşturulamadı."
      );
    }

    console.log("✅ Seslendirme hazır:");
    console.log(result.audioPath);
    console.log(result.disclosure);
  } catch (error) {
    console.error("❌ Test başarısız:");
    console.error(error);
    process.exitCode = 1;
  }
}

testSpeech();