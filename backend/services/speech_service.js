const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TTS_CHARACTERS = 1400;

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sanitizeFileName(value) {
  return String(value || "star_child")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveLanguageCode(value) {
  const languageCode = normalizeText(value).toLowerCase();

  const supportedLanguages = new Set([
    "tr",
    "en",
    "de",
    "fr",
    "es",
    "pt",
    "ar",
    "hi",
    "ja",
    "ko",
    "zh",
  ]);

  return supportedLanguages.has(languageCode)
    ? languageCode
    : "tr";
}

function buildInstructions(languageCode) {
  const languageInstructions = {
    tr: "Yalnızca Türkçe konuş.",
    en: "Speak only in English.",
    de: "Sprich ausschließlich Deutsch.",
    fr: "Parle uniquement en français.",
    es: "Habla únicamente en español.",
    pt: "Fale somente em português.",
    ar: "تحدث باللغة العربية فقط.",
    hi: "केवल हिन्दी में बोलें।",
    ja: "日本語だけで話してください。",
    ko: "한국어로만 말하세요.",
    zh: "只使用中文。",
  };

  return `
${languageInstructions[languageCode] || languageInstructions.tr}

Read like a warm and loving parent telling a child a bedtime story.

Use a gentle, soft, natural, melodic and emotionally expressive voice.
Never sound robotic, mechanical, rushed or like a newsreader.

Speak slowly and clearly.
Use soft, natural pauses between sentences and paragraphs.
Say the child's name with special warmth.

Add gentle wonder during magical moments.
Add a little joy during discoveries and adventures.
Become progressively calmer as bedtime approaches.

Read the lullaby more slowly and softly.
Do not sing.
Do not use exaggerated theatrical acting.

Read the final good-night sentences very gently,
as though the child is safely falling asleep.
  `.trim();
}

function getNarrationPhrases(languageCode) {
  const phrases = {
    tr: {
      hello: (name) => `Merhaba ${name}.`,
      journey:
        "Bu akşam seni yeni bir yıldız yolculuğu bekliyor.",
      ready:
        "Hazırsan, birlikte yıldızlara doğru yola çıkalım.",
      guardian: (star) =>
        `Koruyucu yıldızın ${star} yanında.`,
      lullaby:
        "Şimdi Yıldız Ninnisi zamanı.",
      goodNight: (name) =>
        `İyi geceler ${name}.`,
      tomorrow:
        "Yarın yeni bir yıldız yolculuğunda yeniden buluşacağız.",
    },

    en: {
      hello: (name) => `Hello ${name}.`,
      journey:
        "A new star journey is waiting for you tonight.",
      ready:
        "When you are ready, let us travel toward the stars together.",
      guardian: (star) =>
        `Your guardian star ${star} is beside you.`,
      lullaby:
        "Now it is time for the Star Lullaby.",
      goodNight: (name) =>
        `Good night ${name}.`,
      tomorrow:
        "Tomorrow, we will meet again on a new star journey.",
    },
  };

  return phrases[languageCode] || phrases.en;
}

function buildNarrationText({
  childName,
  guardianStar,
  illustrations,
  openingNote,
  lullaby,
  starMessage,
  languageCode,
}) {
  const phrases =
    getNarrationPhrases(languageCode);

  const safeChildName =
    normalizeText(childName) || "Star Child";

  const safeGuardianStar =
    normalizeText(guardianStar) || "Stella";

  const storyPages = Array.isArray(illustrations)
    ? illustrations
        .map((page) => {
          const title =
            normalizeText(page?.title);

          const text =
            normalizeText(page?.text);

          return [title, text]
            .filter((part) => part.length > 0)
            .join(". ");
        })
        .filter((pageText) => pageText.length > 0)
    : [];

  const narrationParts = [
    phrases.hello(safeChildName),
    phrases.journey,
    phrases.ready,
    phrases.guardian(safeGuardianStar),
    normalizeText(openingNote),
    ...storyPages,
    phrases.lullaby,
    normalizeText(lullaby),
    normalizeText(starMessage),
    phrases.goodNight(safeChildName),
    phrases.tomorrow,
  ];

  return narrationParts
    .map(normalizeText)
    .filter((part) => part.length > 0)
    .join("\n\n");
}

function splitLongText(
  text,
  maxCharacters = MAX_TTS_CHARACTERS
) {
  const normalizedText =
    normalizeText(text);

  if (!normalizedText) {
    return [];
  }

  if (normalizedText.length <= maxCharacters) {
    return [normalizedText];
  }

  const paragraphs = normalizedText
    .split(/\n\s*\n/u)
    .map(normalizeText)
    .filter((paragraph) => paragraph.length > 0);

  const chunks = [];
  let currentChunk = "";

  function saveCurrentChunk() {
    const cleanChunk =
      normalizeText(currentChunk);

    if (cleanChunk) {
      chunks.push(cleanChunk);
    }

    currentChunk = "";
  }

  function addTextPart(value) {
    const part = normalizeText(value);

    if (!part) {
      return;
    }

    const candidate = currentChunk
      ? `${currentChunk}\n\n${part}`
      : part;

    if (candidate.length <= maxCharacters) {
      currentChunk = candidate;
      return;
    }

    saveCurrentChunk();

    if (part.length <= maxCharacters) {
      currentChunk = part;
      return;
    }

    const sentences = part
      .split(/(?<=[.!?…。！？])\s+/u)
      .map(normalizeText)
      .filter((sentence) => sentence.length > 0);

    if (sentences.length <= 1) {
      for (
        let start = 0;
        start < part.length;
        start += maxCharacters
      ) {
        const piece = normalizeText(
          part.slice(
            start,
            start + maxCharacters
          )
        );

        if (piece) {
          chunks.push(piece);
        }
      }

      return;
    }

    for (const sentence of sentences) {
      addTextPart(sentence);
    }
  }

  for (const paragraph of paragraphs) {
    addTextPart(paragraph);
  }

  saveCurrentChunk();

  return chunks;
}

async function createSpeechChunk({
  text,
  voice,
  instructions,
}) {
  if (!text || !text.trim()) {
    throw new Error(
      "Boş seslendirme parçası oluşturulamaz."
    );
  }

  const response =
    await client.audio.speech.create({
      model:
        process.env.STAR_CHILD_TTS_MODEL ||
        "gpt-4o-mini-tts",

      voice,
      input: text,
      instructions,
      response_format: "mp3",
    });

  return Buffer.from(
    await response.arrayBuffer()
  );
}

async function createStorySpeech({
  profile,
  story,
  outputDirectory,
  voice = "marin",
}) {
  if (profile?.voiceEnabled === false) {
    return null;
  }

  if (!profile) {
    throw new Error(
      "Seslendirme için çocuk profili bulunamadı."
    );
  }

  if (!story) {
    throw new Error(
      "Seslendirme için masal verisi bulunamadı."
    );
  }

  if (
    !Array.isArray(story.illustrations) ||
    story.illustrations.length === 0
  ) {
    throw new Error(
      "Seslendirilecek masal sayfaları bulunamadı."
    );
  }

  fs.mkdirSync(outputDirectory, {
    recursive: true,
  });

  const languageCode =
    resolveLanguageCode(
      profile.storyLanguage
    );

  const narrationText =
    buildNarrationText({
      childName:
        profile.childName || profile.name,

      guardianStar:
        story.guardianStar,

      illustrations:
        story.illustrations,

      openingNote:
        story.openingNote,

      lullaby:
        story.lullaby,

      starMessage:
        story.starMessage,

      languageCode,
    });

  if (!narrationText) {
    throw new Error(
      "Seslendirilecek masal metni boş."
    );
  }

  const narrationChunks =
    splitLongText(narrationText);

  if (narrationChunks.length === 0) {
    throw new Error(
      "Seslendirme parçaları oluşturulamadı."
    );
  }

  console.log(
    `🎙️ Seslendirme ${narrationChunks.length} güvenli parçaya ayrıldı.`
  );

  const instructions =
    buildInstructions(languageCode);

  const audioBuffers = [];

  for (
    let index = 0;
    index < narrationChunks.length;
    index += 1
  ) {
    const chunk =
      narrationChunks[index];

    console.log(
      `🎧 Ses parçası ${index + 1}/${narrationChunks.length} hazırlanıyor...`
    );

    const audioBuffer =
      await createSpeechChunk({
        text: chunk,
        voice,
        instructions,
      });

    audioBuffers.push(audioBuffer);
  }

  if (audioBuffers.length === 0) {
    throw new Error(
      "Ses dosyası üretilemedi."
    );
  }

  const combinedBuffer =
    Buffer.concat(audioBuffers);

  const childName =
    profile.childName ||
    profile.name ||
    "star_child";

  const fileName =
    `${sanitizeFileName(childName)}_` +
    `Star_Story_Narration.mp3`;

  const outputPath =
    path.join(
      outputDirectory,
      fileName
    );

  await fs.promises.writeFile(
    outputPath,
    combinedBuffer
  );

  if (!fs.existsSync(outputPath)) {
    throw new Error(
      "Seslendirme dosyası kaydedilemedi."
    );
  }

  console.log(
    `✅ Seslendirme hazır: ${outputPath}`
  );

  return {
    outputPath,
    fileName,
    narrationText,
    narrationChunkCount:
      narrationChunks.length,
    voice,
    languageCode,

    disclosure:
      "This narration was generated using artificial intelligence.",
  };
}

module.exports = {
  createStorySpeech,
};