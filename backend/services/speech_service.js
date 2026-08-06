const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LANGUAGE_INSTRUCTIONS = {
  auto: `
Speak in the language of the provided text.

Read like a warm, loving parent telling a child a bedtime story.
Use a gentle, melodic, natural and emotionally expressive voice.
Never sound robotic, mechanical or like a newsreader.

Speak slowly with soft, natural pauses.
Let a subtle smile be heard in the voice.
Add a little wonder during magical moments.
Add gentle excitement during discoveries and adventures.
Become softer and calmer as bedtime approaches.

Read the lullaby more slowly, almost like a soothing melody.
Do not sing and do not exaggerate theatrical acting.

The final sentences should sound peaceful and reassuring,
as though the child is safely falling asleep.
`,

  tr: `
Yalnızca Türkçe konuş.

Çocuğuna uyku öncesi masal okuyan sevgi dolu,
şefkatli ve huzurlu bir ebeveyn gibi anlat.

Sesin sıcak, doğal, yumuşak, melodik,
gülümseyen ve duygulu olsun.

Asla robotik, mekanik, aceleci,
haber sunucusu gibi veya tekdüze konuşma.

Cümleleri yavaş ve anlaşılır oku.
Virgüllerde kısa, paragraflarda daha belirgin doğal duraklamalar yap.
Çocuğun adını söylerken sesini özellikle sıcak ve yakın tut.

Büyülü anlarda hafif bir hayranlık hissettir.
Keşif ve macera anlarında sesine küçük bir neşe ve heyecan kat.
Duygusal anlarda sesini yumuşat.
Uykuya yaklaştıkça konuşma hızını biraz azalt.

Ninni bölümünü daha sakin, daha yavaş ve melodik oku.
Şarkı söyleme; huzurlu bir ninni anlatımı kullan.
Abartılı tiyatro oyunculuğu yapma.

“İyi geceler” ile başlayan son bölümü,
çocuk güvenle uykuya dalıyormuş gibi
çok yumuşak, sakin ve sevgi dolu söyle.
`,

  en: `
Speak only in English.

Read like a warm and loving parent telling a child a bedtime story.
Use a gentle, melodic, natural and emotionally expressive voice.
Never sound robotic, mechanical, rushed or like a newsreader.

Speak slowly with soft and natural pauses.
Let a subtle smile be heard in the voice.
Say the child's name with special warmth and closeness.

Add gentle wonder during magical moments.
Become slightly brighter during discoveries and adventures.
Become softer during tender moments.
Slow down gradually as bedtime approaches.

Read the lullaby more slowly with a soothing melodic rhythm.
Do not sing and avoid exaggerated theatrical acting.

Read the final good-night sentences very softly,
as though the child is safely falling asleep.
`,

  de: `
Sprich ausschließlich Deutsch.

Erzähle wie ein liebevoller Elternteil,
der einem Kind eine Gute-Nacht-Geschichte vorliest.
Sprich warm, sanft, melodisch, natürlich und langsam.
Klinge niemals roboterhaft, mechanisch oder wie ein Nachrichtensprecher.

Mache weiche, natürliche Pausen.
Sprich den Namen des Kindes besonders liebevoll aus.
Zeige in magischen Momenten leises Staunen,
bei Entdeckungen sanfte Freude
und werde zum Ende hin immer ruhiger.

Lies das Schlaflied besonders langsam und beruhigend,
ohne zu singen oder übertrieben zu schauspielern.
Sprich die letzten Gute-Nacht-Sätze sehr sanft,
als würde das Kind gerade sicher einschlafen.
`,

  fr: `
Parle uniquement en français.

Raconte comme un parent tendre et aimant
qui lit une histoire du soir à son enfant.
Utilise une voix chaleureuse, douce, mélodieuse,
naturelle et apaisante.

Ne parle jamais comme un robot,
une machine ou un présentateur de nouvelles.
Lis lentement avec des pauses naturelles.
Prononce le prénom de l’enfant avec une tendresse particulière.

Ajoute un léger émerveillement dans les moments magiques,
une douce joie pendant les découvertes,
puis ralentis progressivement à l’approche du sommeil.

Lis la berceuse plus lentement avec un rythme apaisant,
sans chanter ni jouer de manière théâtrale.
Prononce les dernières phrases très doucement,
comme si l’enfant s’endormait en toute sécurité.
`,

  es: `
Habla únicamente en español.

Narra como una madre o un padre cariñoso
que cuenta un cuento antes de dormir.
Usa una voz cálida, suave, melódica,
natural, tranquila y llena de ternura.

Nunca suenes robótico, mecánico,
apresurado ni como un presentador de noticias.
Lee lentamente y haz pausas naturales.
Pronuncia el nombre del niño con especial cariño.

Añade un poco de asombro en los momentos mágicos,
alegría suave durante los descubrimientos
y calma progresiva al acercarse el sueño.

Lee la canción de cuna más despacio,
con un ritmo tranquilo, sin cantar
ni actuar de forma exagerada.

Di las últimas frases de buenas noches muy suavemente,
como si el niño estuviera quedándose dormido.
`,

  pt: `
Fale somente em português.

Narre como uma mãe ou um pai carinhoso
lendo uma história antes de dormir.
Use uma voz calorosa, suave, melódica,
natural, tranquila e acolhedora.

Nunca soe robótico, mecânico,
apressado ou como um apresentador de notícias.
Leia devagar e faça pausas naturais.
Diga o nome da criança com carinho especial.

Demonstre um pouco de encanto nos momentos mágicos,
alegria suave nas descobertas
e fique progressivamente mais calmo perto da hora de dormir.

Leia a canção de ninar mais lentamente,
com ritmo sereno, sem cantar
nem fazer atuação exagerada.

Diga as frases finais de boa noite com muita suavidade,
como se a criança estivesse adormecendo em segurança.
`,

  ar: `
تحدث باللغة العربية فقط.

اقرأ كوالد محب يروي لطفله قصة هادئة قبل النوم.
استخدم صوتًا دافئًا وحنونًا وطبيعيًا وهادئًا وإيقاعًا لطيفًا.

لا تتحدث بصوت آلي أو ميكانيكي أو سريع،
ولا بأسلوب مذيع الأخبار.
اقرأ ببطء مع توقفات طبيعية وناعمة.
انطق اسم الطفل بمحبة ودفء خاصين.

أظهر دهشة لطيفة في اللحظات السحرية،
وفرحًا هادئًا أثناء الاكتشافات،
ثم اجعل صوتك أكثر هدوءًا مع اقتراب النوم.

اقرأ التهويدة ببطء أكبر وبإيقاع مريح،
من دون غناء أو تمثيل مبالغ فيه.
قل عبارات الختام بصوت ناعم جدًا،
كما لو أن الطفل يغفو بأمان.
`,

  hi: `
केवल हिन्दी में बोलें।

ऐसे सुनाएँ जैसे कोई स्नेही माता-पिता
बच्चे को सोने से पहले कहानी सुना रहे हों।
आवाज़ गर्म, कोमल, मधुर, स्वाभाविक और शांत हो।

कभी भी रोबोटिक, यांत्रिक,
जल्दबाज़ या समाचार-वाचक जैसी आवाज़ में न बोलें।
धीरे पढ़ें और स्वाभाविक विराम लें।
बच्चे का नाम विशेष स्नेह से बोलें।

जादुई क्षणों में हल्का आश्चर्य,
खोज के समय कोमल उत्साह
और सोने के समय के पास अधिक शांति रखें।

लोरी को और धीरे तथा मधुर लय में पढ़ें।
गाएँ नहीं और अत्यधिक अभिनय न करें।
अंतिम शुभरात्रि वाक्य बहुत कोमलता से कहें,
मानो बच्चा सुरक्षित रूप से सो रहा हो।
`,

  ja: `
日本語だけで話してください。

愛情深い親が子どもに寝る前のお話を読むように、
温かく、やさしく、自然で、
少しメロディーを感じる落ち着いた声で読んでください。

ロボットのような声、機械的な声、
急いだ読み方、ニュースのような話し方は避けてください。
ゆっくり読み、自然で柔らかな間を取ってください。
子どもの名前は特に愛情を込めて呼んでください。

魔法の場面では小さな驚きを、
冒険ではやさしい喜びを表現し、
眠りに近づくにつれてさらに静かにしてください。

子守歌はもっとゆっくり、
心地よいリズムで読んでください。
歌わず、大げさな演技もしないでください。

最後のおやすみの言葉は、
子どもが安心して眠りにつくように
とてもやさしく伝えてください。
`,

  ko: `
한국어로만 말하세요.

사랑하는 부모가 아이에게 잠자리 동화를 읽어 주듯이
따뜻하고 부드럽고 자연스럽고
은은하게 리듬감 있는 목소리로 읽어 주세요.

로봇처럼, 기계적으로,
급하게 또는 뉴스 진행자처럼 말하지 마세요.
천천히 읽고 자연스럽고 부드러운 쉼을 주세요.
아이의 이름은 특별히 다정하게 불러 주세요.

마법 같은 순간에는 작은 감탄을,
모험과 발견에는 부드러운 기쁨을 담고,
잠들 시간이 가까워질수록 더 차분해지세요.

자장가 부분은 더 천천히,
편안한 리듬으로 읽어 주세요.
노래하거나 과장되게 연기하지 마세요.

마지막 잘 자라는 문장은
아이가 안전하게 잠드는 것처럼
아주 부드럽게 말해 주세요.
`,

  zh: `
只使用中文。

像一位充满爱意的父母
在睡前为孩子讲故事一样朗读。
声音要温暖、轻柔、自然、舒缓，
并带有细腻的韵律感。

不要像机器人、机器、
新闻播报员一样说话，也不要语速过快。
慢慢朗读，并加入自然柔和的停顿。
念到孩子名字时，要格外温柔亲切。

在神奇的时刻表现出轻轻的惊喜，
在探索和冒险时加入柔和的喜悦，
临近睡眠时逐渐变得更加安静。

摇篮曲部分要读得更慢、更舒缓，
不要唱歌，也不要过度表演。

最后的晚安句子要非常轻柔，
仿佛孩子正在安心地进入梦乡。
`,
};

const NARRATION_PHRASES = {
  tr: {
    hello: (name) => `Merhaba ${name}.`,
    journey: "Bu akşam seni yeni bir yıldız yolculuğu bekliyor.",
    ready: "Hazırsan, birlikte yıldızlara doğru yola çıkalım.",
    guardian: (star) => `Koruyucu yıldızın ${star} yanında.`,
    lullaby: "Şimdi Yıldız Ninnisi zamanı.",
    goodNight: (name) => `İyi geceler ${name}.`,
    tomorrow:
      "Yarın yeni bir yıldız yolculuğunda yeniden buluşacağız.",
  },

  en: {
    hello: (name) => `Hello ${name}.`,
    journey: "A new star journey is waiting for you tonight.",
    ready: "When you are ready, let us travel toward the stars together.",
    guardian: (star) => `Your guardian star ${star} is beside you.`,
    lullaby: "Now it is time for the Star Lullaby.",
    goodNight: (name) => `Good night ${name}.`,
    tomorrow:
      "Tomorrow, we will meet again on a brand-new star journey.",
  },

  de: {
    hello: (name) => `Hallo ${name}.`,
    journey: "Heute Abend wartet eine neue Sternenreise auf dich.",
    ready:
      "Wenn du bereit bist, reisen wir gemeinsam zu den Sternen.",
    guardian: (star) => `Dein Schutzstern ${star} ist bei dir.`,
    lullaby: "Jetzt ist es Zeit für das Sternen-Schlaflied.",
    goodNight: (name) => `Gute Nacht ${name}.`,
    tomorrow:
      "Morgen treffen wir uns auf einer neuen Sternenreise wieder.",
  },

  fr: {
    hello: (name) => `Bonjour ${name}.`,
    journey:
      "Ce soir, un nouveau voyage parmi les étoiles t’attend.",
    ready:
      "Lorsque tu seras prêt, partons ensemble vers les étoiles.",
    guardian: (star) =>
      `Ton étoile gardienne ${star} est près de toi.`,
    lullaby:
      "Maintenant, il est temps d’écouter la Berceuse des Étoiles.",
    goodNight: (name) => `Bonne nuit ${name}.`,
    tomorrow:
      "Demain, nous nous retrouverons pour un nouveau voyage étoilé.",
  },

  es: {
    hello: (name) => `Hola ${name}.`,
    journey:
      "Esta noche te espera un nuevo viaje entre las estrellas.",
    ready:
      "Cuando estés preparado, viajemos juntos hacia las estrellas.",
    guardian: (star) =>
      `Tu estrella guardiana ${star} está a tu lado.`,
    lullaby:
      "Ahora es el momento de la Canción de Cuna de las Estrellas.",
    goodNight: (name) => `Buenas noches ${name}.`,
    tomorrow:
      "Mañana volveremos a encontrarnos en un nuevo viaje estelar.",
  },

  pt: {
    hello: (name) => `Olá ${name}.`,
    journey:
      "Esta noite, uma nova jornada entre as estrelas espera por você.",
    ready:
      "Quando estiver pronto, vamos viajar juntos até as estrelas.",
    guardian: (star) =>
      `Sua estrela guardiã ${star} está ao seu lado.`,
    lullaby:
      "Agora é hora da Canção de Ninar das Estrelas.",
    goodNight: (name) => `Boa noite ${name}.`,
    tomorrow:
      "Amanhã nos encontraremos novamente em uma nova jornada estelar.",
  },
};
function sanitizeFileName(value) {
  return String(value || "star_child")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveNarrationLanguage(languageCode) {
  if (NARRATION_PHRASES[languageCode]) {
    return languageCode;
  }

  return "tr";
}

function buildNarrationText({
  childName,
  guardianStar,
  illustrations,
  lullaby,
  languageCode = "tr",
}) {
  const resolvedLanguage =
    resolveNarrationLanguage(languageCode);

  const phrases =
    NARRATION_PHRASES[resolvedLanguage];

  const pageTexts = illustrations
    .map(
      (page) =>
        `${page.title}. ${page.text}`
    )
    .join("\n\n");

  return [
    phrases.hello(childName),
    phrases.journey,
    phrases.ready,
    phrases.guardian(guardianStar),
    pageTexts,
    phrases.lullaby,
    lullaby,
    phrases.goodNight(childName),
    phrases.tomorrow,
  ]
    .filter(
      (part) =>
        typeof part === "string" &&
        part.trim().isNotEmpty
    )
    .join("\n\n");
}

/*
 * TTS servisinin tek istek sınırını güvenli biçimde
 * aşmamak için metni yaklaşık 5.000 karakterlik
 * doğal parçalara ayırır.
 *
 * Önce paragrafları, gerekirse cümleleri korur.
 */
function splitNarrationText(
  text,
  maxCharacters = 5000
) {
  const normalizedText =
    String(text || "").trim();

  if (!normalizedText) {
    return [];
  }

  if (
    normalizedText.length <=
    maxCharacters
  ) {
    return [normalizedText];
  }

  const paragraphs =
    normalizedText
      .split(/\n\s*\n/u)
      .map((paragraph) =>
        paragraph.trim()
      )
      .filter(Boolean);

  const chunks = [];
  let currentChunk = "";

  function pushCurrentChunk() {
    const cleanChunk =
      currentChunk.trim();

    if (cleanChunk) {
      chunks.push(cleanChunk);
    }

    currentChunk = "";
  }

  function appendPart(part) {
    const cleanPart =
      String(part || "").trim();

    if (!cleanPart) {
      return;
    }

    const candidate =
      currentChunk.length > 0
        ? `${currentChunk}\n\n${cleanPart}`
        : cleanPart;

    if (
      candidate.length <=
      maxCharacters
    ) {
      currentChunk = candidate;
      return;
    }

    pushCurrentChunk();

    if (
      cleanPart.length <=
      maxCharacters
    ) {
      currentChunk = cleanPart;
      return;
    }

    const sentences =
      cleanPart
        .split(
          /(?<=[.!?…。！？])\s+/u
        )
        .map((sentence) =>
          sentence.trim()
        )
        .filter(Boolean);

    for (const sentence of sentences) {
      if (
        sentence.length <=
        maxCharacters
      ) {
        appendPart(sentence);
        continue;
      }

      /*
       * Çok uzun tek bir cümle gelirse
       * güvenli karakter parçalarına böl.
       */
      for (
        let start = 0;
        start < sentence.length;
        start += maxCharacters
      ) {
        const piece =
          sentence
            .slice(
              start,
              start + maxCharacters
            )
            .trim();

        if (piece) {
          appendPart(piece);
        }
      }
    }
  }

  for (const paragraph of paragraphs) {
    appendPart(paragraph);
  }

  pushCurrentChunk();

  return chunks;
}

async function createSpeechBuffer({
  text,
  instructions,
  voice,
}) {
  const response =
    await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
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
  /*
   * Sadece açıkça false ise ses kapalıdır.
   * Alan gönderilmezse seslendirme çalışmaya devam eder.
   */
  if (
    profile?.voiceEnabled === false
  ) {
    return null;
  }

  if (!story) {
    throw new Error(
      "Seslendirme için masal verisi bulunamadı."
    );
  }

  if (
    !Array.isArray(
      story.illustrations
    ) ||
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
    profile.storyLanguage ||
    "auto";

  const narrationText =
    buildNarrationText({
      childName:
        profile.childName,

      guardianStar:
        story.guardianStar,

      illustrations:
        story.illustrations,

      lullaby:
        story.lullaby,

      languageCode,
    });

  const instructions =
    LANGUAGE_INSTRUCTIONS[
      languageCode
    ] ||
    LANGUAGE_INSTRUCTIONS.auto;

  const narrationChunks =
    splitNarrationText(
      narrationText
    );

  if (
    narrationChunks.length === 0
  ) {
    throw new Error(
      "Seslendirilecek metin oluşturulamadı."
    );
  }

  console.log(
    `🎙️ Seslendirme ${narrationChunks.length} güvenli parçaya ayrıldı.`
  );

  const audioBuffers = [];

  for (
    let index = 0;
    index <
    narrationChunks.length;
    index += 1
  ) {
    console.log(
      `🎧 Ses parçası ${index + 1}/${narrationChunks.length} hazırlanıyor...`
    );

    const audioBuffer =
      await createSpeechBuffer({
        text:
          narrationChunks[index],

        instructions,
        voice,
      });

    audioBuffers.push(
      audioBuffer
    );
  }

  /*
   * MP3 akışları sıralı biçimde birleştirilir.
   * Kullanıcı tek bir ses dosyası alır.
   */
  const combinedBuffer =
    Buffer.concat(
      audioBuffers
    );

  const fileName =
    `${sanitizeFileName(
      profile.childName
    )}_` +
    `Yildiz_Masali_Seslendirme.mp3`;

  const outputPath =
    path.join(
      outputDirectory,
      fileName
    );

  await fs.promises.writeFile(
    outputPath,
    combinedBuffer
  );

  console.log(
    `✅ Seslendirme hazır: ${outputPath}`
  );

  return {
    outputPath,
    fileName,
    narrationText,

    narrationChunkCount:
      narrationChunks.length,

    disclosure:
      "Bu seslendirme yapay zekâ tarafından oluşturulmuştur.",
  };
}

module.exports = {
  createStorySpeech,
};