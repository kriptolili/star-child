const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LANGUAGE_NAMES = {
  auto: "the same language as the provided story",
  tr: "Turkish",
  en: "English",
  de: "German",
  fr: "French",
  es: "Spanish",
  pt: "Portuguese",
  ar: "Arabic",
  hi: "Hindi",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
};

const NARRATION_PHRASES = {
  tr: {
    hello: (name) => `Merhaba ${name}.`,
    journey:
      "Bu akşam seni yeni bir yıldız yolculuğu bekliyor.",
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
      "A new journey among the stars is waiting for you tonight.",
    guardian: (star) =>
      `Your guardian star, ${star}, is beside you.`,
    lullaby:
      "Now it is time for the Star Lullaby.",
    goodNight: (name) =>
      `Good night, ${name}.`,
    tomorrow:
      "Tomorrow, we will meet again for another journey among the stars.",
  },

  de: {
    hello: (name) => `Hallo ${name}.`,
    journey:
      "Heute Abend wartet eine neue Sternenreise auf dich.",
    guardian: (star) =>
      `Dein Schutzstern ${star} ist bei dir.`,
    lullaby:
      "Jetzt ist es Zeit für das Sternen-Schlaflied.",
    goodNight: (name) =>
      `Gute Nacht, ${name}.`,
    tomorrow:
      "Morgen treffen wir uns zu einer neuen Sternenreise wieder.",
  },

  fr: {
    hello: (name) => `Bonjour ${name}.`,
    journey:
      "Ce soir, un nouveau voyage parmi les étoiles t’attend.",
    guardian: (star) =>
      `Ton étoile gardienne, ${star}, est près de toi.`,
    lullaby:
      "Maintenant, il est temps d’écouter la Berceuse des Étoiles.",
    goodNight: (name) =>
      `Bonne nuit, ${name}.`,
    tomorrow:
      "Demain, nous nous retrouverons pour un nouveau voyage étoilé.",
  },

  es: {
    hello: (name) => `Hola ${name}.`,
    journey:
      "Esta noche te espera un nuevo viaje entre las estrellas.",
    guardian: (star) =>
      `Tu estrella guardiana, ${star}, está a tu lado.`,
    lullaby:
      "Ahora es el momento de la Canción de Cuna de las Estrellas.",
    goodNight: (name) =>
      `Buenas noches, ${name}.`,
    tomorrow:
      "Mañana volveremos a encontrarnos en un nuevo viaje estelar.",
  },

  pt: {
    hello: (name) => `Olá ${name}.`,
    journey:
      "Esta noite, uma nova jornada entre as estrelas espera por você.",
    guardian: (star) =>
      `Sua estrela guardiã, ${star}, está ao seu lado.`,
    lullaby:
      "Agora é hora da Canção de Ninar das Estrelas.",
    goodNight: (name) =>
      `Boa noite, ${name}.`,
    tomorrow:
      "Amanhã nos encontraremos novamente em uma nova jornada estelar.",
  },

  ar: {
    hello: (name) => `مرحبًا ${name}.`,
    journey:
      "تنتظرك الليلة رحلة جديدة بين النجوم.",
    guardian: (star) =>
      `نجمك الحارس ${star} بجانبك.`,
    lullaby:
      "والآن حان وقت تهويدة النجوم.",
    goodNight: (name) =>
      `تصبح على خير يا ${name}.`,
    tomorrow:
      "سنلتقي غدًا في رحلة جديدة بين النجوم.",
  },

  hi: {
    hello: (name) => `नमस्ते ${name}।`,
    journey:
      "आज रात सितारों के बीच एक नई यात्रा तुम्हारा इंतज़ार कर रही है।",
    guardian: (star) =>
      `तुम्हारा रक्षक तारा ${star} तुम्हारे साथ है।`,
    lullaby:
      "अब तारों की लोरी का समय है।",
    goodNight: (name) =>
      `शुभ रात्रि, ${name}।`,
    tomorrow:
      "कल हम सितारों की एक नई यात्रा में फिर मिलेंगे।",
  },

  ja: {
    hello: (name) => `こんにちは、${name}。`,
    journey:
      "今夜、新しい星の旅があなたを待っています。",
    guardian: (star) =>
      `守護星の${star}がそばにいます。`,
    lullaby:
      "さあ、星の子守歌の時間です。",
    goodNight: (name) =>
      `おやすみなさい、${name}。`,
    tomorrow:
      "明日、また新しい星の旅で会いましょう。",
  },

  ko: {
    hello: (name) => `안녕, ${name}.`,
    journey:
      "오늘 밤 새로운 별빛 여행이 너를 기다리고 있어.",
    guardian: (star) =>
      `수호별 ${star}가 네 곁에 있어.`,
    lullaby:
      "이제 별빛 자장가를 들을 시간이야.",
    goodNight: (name) =>
      `잘 자, ${name}.`,
    tomorrow:
      "내일 새로운 별빛 여행에서 다시 만나자.",
  },

  zh: {
    hello: (name) => `你好，${name}。`,
    journey:
      "今晚，一场全新的星空旅程正在等着你。",
    guardian: (star) =>
      `你的守护星${star}就在你身边。`,
    lullaby:
      "现在，是星光摇篮曲的时间。",
    goodNight: (name) =>
      `晚安，${name}。`,
    tomorrow:
      "明天，我们将在新的星空旅程中再次相见。",
  },
};

function sanitizeFileName(value) {
  return String(value || "star_child")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function buildInstructions(languageCode) {
  const language =
    LANGUAGE_NAMES[languageCode] ||
    LANGUAGE_NAMES.auto;

  return `
Speak only in ${language}.

Narrate as a loving parent reading a premium bedtime story
to one child in a quiet room.

The voice must feel warm, intimate, natural and emotionally alive.
Keep a soft smile in the voice.
Use gentle melodic intonation without singing.
Maintain clear pronunciation and a steady, comfortable volume.

Do not sound robotic, synthetic, mechanical, flat,
rushed, formal, theatrical or like a news presenter.

Use a calm conversational pace.
Pause briefly at commas.
Pause naturally between sentences.
Pause more clearly between story pages.
Never make unusually long or silent pauses.

Say the child's name with special warmth and closeness.

During magical moments, add quiet wonder.
During discoveries, become gently brighter and more curious.
During tender moments, become softer and reassuring.
Gradually become calmer as the story approaches bedtime.

Read the lullaby more slowly and softly,
with a soothing rhythm, but do not sing.

Deliver the final good-night sentences very gently,
as though the child is safe, peaceful and falling asleep.

Keep the same narrator personality, tone, distance,
volume and speaking style throughout the entire recording.
`.trim();
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
    NARRATION_PHRASES[languageCode];

  const pageTexts = illustrations
    .map((page) => {
      const title =
        normalizeText(page?.title);

      const text =
        normalizeText(page?.text);

      return [title, text]
        .filter(Boolean)
        .join(".\n");
    })
    .filter(Boolean);

  /*
   * Otomatik dilde Türkçe sabit cümle eklemiyoruz.
   * Böylece masal hangi dildeyse ses de tamamen o dilde kalır.
   */
  if (!phrases) {
    return [
      normalizeText(openingNote),
      ...pageTexts,
      normalizeText(lullaby),
      normalizeText(starMessage),
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    
    
    normalizeText(openingNote),
    phrases.guardian(guardianStar),
    ...pageTexts,
    phrases.lullaby,
    normalizeText(lullaby),
    normalizeText(starMessage),
    phrases.goodNight(childName),
    phrases.tomorrow,
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function createStorySpeech({
  profile,
  story,
  outputDirectory,

  /*
   * OpenAI, en iyi kalite için marin veya cedar öneriyor.
   * Varsayılanı cedar yaptık; .env ile değiştirebilirsin.
   */
  voice =
    process.env.STAR_CHILD_VOICE ||
    "cedar",
}) {
  if (profile?.voiceEnabled === false) {
    return null;
  }

  if (!profile?.childName) {
    throw new Error(
      "Seslendirme için çocuk adı gereklidir."
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
    normalizeText(profile.storyLanguage) ||
    "auto";

  const narrationText = buildNarrationText({
    childName: profile.childName,
    guardianStar:
      normalizeText(story.guardianStar) ||
      "Stella",
    illustrations: story.illustrations,
    openingNote: story.openingNote,
    lullaby: story.lullaby,
    starMessage: story.starMessage,
    languageCode,
  });

  if (!narrationText) {
    throw new Error(
      "Seslendirilecek masal metni boş."
    );
  }

  const response =
    await client.audio.speech.create({
      model:
        process.env.STAR_CHILD_TTS_MODEL ||
        "gpt-4o-mini-tts-2025-12-15",

      voice,

      input: narrationText,

      instructions:
        buildInstructions(languageCode),

      response_format: "mp3",
    });

  const buffer = Buffer.from(
    await response.arrayBuffer()
  );

  const fileName =
    `${sanitizeFileName(profile.childName)}_` +
    `Star_Story_Narration.mp3`;

  const outputPath = path.join(
    outputDirectory,
    fileName
  );

  await fs.promises.writeFile(
    outputPath,
    buffer
  );

  return {
    outputPath,
    fileName,
    narrationText,
    voice,
    languageCode,

    disclosure:
      "This narration was generated using artificial intelligence.",
  };
}

module.exports = {
  createStorySpeech,
};