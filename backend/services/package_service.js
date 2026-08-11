const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { generateIllustration } = require("./image_service");
const { createStorySpeech } = require("./speech_service");
const { createStoryVideo } = require("./video_service");
const videoJobStore = require("./video_job_store");

// Video, Remotion Lambda kurulana kadar geçici olarak devre dışı.
// Render'ın CPU'su Remotion render işini (Chromium + kare kare
// oluşturma) kaldıramadığı için video zaman aşımına uğruyordu.
// Bu flag'i true yaptığında video akışı hiçbir kod silinmeden
// aynen eskisi gibi çalışmaya devam eder.
const ENABLE_VIDEO = false;

function createDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function safeFileName(value) {
  return String(value || "star_child")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function findExistingFont(paths) {
  return paths.find((fontPath) => fs.existsSync(fontPath)) || null;
}

function registerFonts(doc) {
  // DÜZELTME: Önceki hâli yalnızca macOS'a özel sistem font yollarını
  // (/System/Library/Fonts/...) arıyordu. Render'ın Linux sunucusunda
  // bu yollar hiç yok, bu yüzden Helvetica'ya düşüyordu ve Helvetica
  // Türkçe karakterleri (ç, ş, ı, ğ, ü, ö) doğru render edemediği için
  // PDF'te bozuk karakterler çıkıyordu.
  //
  // Artık proje ile birlikte gelen (backend/fonts/) bir font
  // kullanılıyor — hem local'de (Mac) hem Render'da (Linux) aynı
  // dosya, aynı sonuç. Noto Sans, Türkçe karakterleri tam destekler.
  const bundledFontPath = path.join(
    __dirname,
    "..",
    "fonts",
    "NotoSans-Regular.ttf"
  );

  if (fs.existsSync(bundledFontPath)) {
    doc.registerFont("StarBody", bundledFontPath);
    doc.registerFont("StarBold", bundledFontPath);
    return {
      regular: "StarBody",
      bold: "StarBold",
    };
  }

  // Bundled font bulunamazsa (beklenmedik durum), eski macOS yolu
  // yedek olarak denenir; o da yoksa PDFKit'in dahili Helvetica'sına
  // düşülür (Türkçe karakterler yine bozuk çıkabilir).
  const fallbackFontPath = findExistingFont([
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
  ]);

  if (fallbackFontPath) {
    doc.registerFont("StarBody", fallbackFontPath);
    doc.registerFont("StarBold", fallbackFontPath);
  }

  return {
    regular: fallbackFontPath ? "StarBody" : "Helvetica",
    bold: fallbackFontPath ? "StarBold" : "Helvetica-Bold",
  };
}

const colors = {
  midnight: "#171432",
  deepBlue: "#252050",
  cream: "#FFF8EA",
  gold: "#E9B86E",
  lavender: "#BBA9D8",
  text: "#514B63",
  white: "#FFFFFF",
};

function fillPage(doc, color) {
  doc.save().rect(0, 0, doc.page.width, doc.page.height).fill(color).restore();
}

function addStars(doc) {
  const stars = [
    [50, 70, 2],
    [120, 115, 1.2],
    [520, 80, 1.8],
    [480, 170, 1.1],
    [75, 420, 1.5],
    [530, 470, 2],
    [90, 740, 1.2],
    [500, 760, 1.5],
  ];
  doc.save();
  for (const [x, y, radius] of stars) {
    doc.circle(x, y, radius).fill(colors.gold);
  }
  doc.restore();
}

function getLocalizedLabels(languageCode) {
  const labels = {
    tr: {
      childBook: "YILDIZ KİTABI",
      guardianStar: "DOST YILDIZI",
      inspiredBy: "İLHAM ALDIĞI GERÇEK YILDIZ",
      lullaby: "Yıldız Ninnisi",
      whispers: "FISILDIYOR",
      onlyFor: "YALNIZCA SENİN İÇİN",
      closingTitle: "Sevgili",
      closingBrand: "SEVGİYLE, STAR CHILD TALES",
      closingText:
        "Bu Yıldız Kitabı, dünyaya geldiğin o eşsiz andan yaratıcı biçimde ilham alınarak yalnızca senin için hazırlandı.\n\n" +
        "Belki bugün bu satırları sana seni çok seven biri okuyacak. Belki yıllar sonra bu kitabı kendi ellerinle yeniden açacaksın.\n\n" +
        "O gün geldiğinde çocukluğunun hayal gücünü, ilk gülüşlerini ve bu sayfalarda saklı sıcaklığı yeniden bulmanı dileriz.\n\n" +
        "Bu kitap kapanabilir...\nAma yıldız yolculuğun hiç bitmeyecek.",
    },
    en: {
      childBook: "STAR BOOK",
      guardianStar: "YOUR FRIEND STAR",
      inspiredBy: "INSPIRED BY THE REAL STAR",
      lullaby: "Star Lullaby",
      whispers: "WHISPERS",
      onlyFor: "CREATED JUST FOR YOU",
      closingTitle: "Dear",
      closingBrand: "WITH LOVE, STAR CHILD TALES",
      closingText:
        "This Star Book was created just for you, inspired by the wonder of the moment you came into the world.\n\n" +
        "Someone who loves you may read these words to you today. Years from now, you may open this book again with your own hands.\n\n" +
        "May you rediscover the imagination, warmth and wonder of your childhood within these pages.\n\n" +
        "This book may close...\nBut your star journey will never end.",
    },
    es: {
      childBook: "LIBRO DE LAS ESTRELLAS",
      guardianStar: "TU ESTRELLA AMIGA",
      inspiredBy: "INSPIRADA EN LA ESTRELLA REAL",
      lullaby: "Canción de Cuna Estelar",
      whispers: "SUSURRA",
      onlyFor: "CREADO SOLO PARA TI",
      closingTitle: "Querida",
      closingBrand: "CON AMOR, STAR CHILD TALES",
      closingText:
        "Este Libro de las Estrellas fue creado solo para ti, inspirado en la maravilla del momento en que llegaste al mundo.\n\n" +
        "Tal vez hoy alguien que te quiere mucho te lea estas palabras. Quizás, dentro de muchos años, vuelvas a abrir este libro con tus propias manos.\n\n" +
        "Deseamos que encuentres de nuevo la imaginación, la calidez y la magia de tu infancia en estas páginas.\n\n" +
        "Este libro puede cerrarse...\nPero tu viaje entre las estrellas nunca terminará.",
    },
  };
  return labels[languageCode] || labels.en;
}

function drawCover({ doc, fonts, story, imagePath, profile, labels }) {
  doc.image(imagePath, 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
    fit: [doc.page.width, doc.page.height],
    align: "center",
    valign: "center",
  });
  doc
    .save()
    .rect(0, 0, doc.page.width, doc.page.height)
    .fillOpacity(0.38)
    .fill(colors.midnight)
    .restore();
  doc
    .font(fonts.bold)
    .fontSize(17)
    .fillColor(colors.cream)
    .text(profile.childName, 50, 80, {
      width: doc.page.width - 100,
      align: "center",
    });
  doc
    .font(fonts.bold)
    .fontSize(34)
    .fillColor(colors.white)
    .text(labels.childBook, 40, 115, {
      width: doc.page.width - 80,
      align: "center",
    });
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor(colors.lavender)
    .text(labels.guardianStar, 70, 185, {
      width: doc.page.width - 140,
      align: "center",
      characterSpacing: 1.4,
    });
  doc
    .font(fonts.bold)
    .fontSize(28)
    .fillColor(colors.gold)
    .text(story.guardianStar, 50, 215, {
      width: doc.page.width - 100,
      align: "center",
    });
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor(colors.cream)
    .text(story.openingNote || "", 70, 270, {
      width: doc.page.width - 140,
      align: "center",
      lineGap: 4,
    });
  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor(colors.gold)
    .text("STAR CHILD TALES", 0, doc.page.height - 45, {
      width: doc.page.width,
      align: "center",
      characterSpacing: 2,
    });
}

function drawManifestoPage({ doc, fonts, profile, story, labels }) {
  doc.addPage();
  fillPage(doc, colors.midnight);
  addStars(doc);
  doc
    .font(fonts.bold)
    .fontSize(42)
    .fillColor(colors.gold)
    .text("✦", 0, 105, { width: doc.page.width, align: "center" });
  doc
    .font(fonts.bold)
    .fontSize(24)
    .fillColor(colors.cream)
    .text(labels.onlyFor, 65, 210, {
      width: doc.page.width - 130,
      align: "center",
      lineGap: 9,
    });
  doc
    .font(fonts.bold)
    .fontSize(20)
    .fillColor(colors.gold)
    .text(profile.childName, 0, 335, {
      width: doc.page.width,
      align: "center",
    });
  doc
    .font(fonts.regular)
    .fontSize(13)
    .fillColor(colors.cream)
    .text(
      `${profile.birthDate}\n${profile.birthTime}\n${profile.birthPlace}`,
      70,
      400,
      { width: doc.page.width - 140, align: "center", lineGap: 5 },
    );

  // Doğum bilgilerinin hemen altına, o bilgilerden ilham alan kısa
  // kişilik betimlemesi ekleniyor — kullanıcının verdiği doğum
  // tarihi/saat/yer bilgisinin gerçekten kullanıldığının kanıtı.
  const personalityTraits = Array.isArray(story?.personalityTraits)
    ? story.personalityTraits.filter(
        (trait) => typeof trait === "string" && trait.trim().length > 0,
      )
    : [];

  if (personalityTraits.length > 0) {
    doc
      .font(fonts.regular)
      .fontSize(14)
      .fillColor(colors.gold)
      .text(personalityTraits.join("  ·  "), 60, 500, {
        width: doc.page.width - 120,
        align: "center",
        lineGap: 6,
      });
  }
}

function drawGuardianStarPage({ doc, fonts, story, labels }) {
  doc.addPage();
  fillPage(doc, colors.cream);
  doc
    .font(fonts.bold)
    .fontSize(13)
    .fillColor(colors.lavender)
    .text(labels.guardianStar, 65, 80, {
      width: doc.page.width - 130,
      align: "center",
      characterSpacing: 1.4,
    });
  doc
    .font(fonts.bold)
    .fontSize(34)
    .fillColor(colors.midnight)
    .text(story.guardianStar, 50, 120, {
      width: doc.page.width - 100,
      align: "center",
    });
  doc
    .font(fonts.regular)
    .fontSize(16)
    .fillColor(colors.text)
    .text(story.guardianStarMeaning, 75, 190, {
      width: doc.page.width - 150,
      align: "center",
      lineGap: 7,
    });
  doc.roundedRect(65, 310, doc.page.width - 130, 230, 24).fill(colors.deepBlue);
  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor(colors.lavender)
    .text(labels.inspiredBy, 90, 345, {
      width: doc.page.width - 180,
      align: "center",
      characterSpacing: 1,
    });
  doc
    .font(fonts.bold)
    .fontSize(29)
    .fillColor(colors.gold)
    .text(story.inspirationStar || "", 90, 385, {
      width: doc.page.width - 180,
      align: "center",
    });
}

function drawIllustratedPage({ doc, fonts, page, imagePath, pageNumber }) {
  doc.addPage();
  fillPage(doc, colors.cream);
  doc.image(imagePath, 35, 30, {
    fit: [doc.page.width - 70, 545],
    align: "center",
    valign: "center",
  });
  doc
    .font(fonts.bold)
    .fontSize(20)
    .fillColor(colors.midnight)
    .text(page.title, 55, 595, {
      width: doc.page.width - 110,
      align: "center",
    });
  doc
    .font(fonts.regular)
    .fontSize(11.5)
    .fillColor(colors.text)
    .text(page.text, 65, 635, {
      width: doc.page.width - 130,
      align: "center",
      lineGap: 4,
    });
  doc
    .font(fonts.regular)
    .fontSize(8)
    .fillColor("#958CA3")
    .text(String(pageNumber), 0, doc.page.height - 27, {
      width: doc.page.width,
      align: "center",
    });
}

function drawLullabyPage({ doc, fonts, story, labels }) {
  doc.addPage();
  fillPage(doc, colors.midnight);
  addStars(doc);
  doc
    .font(fonts.bold)
    .fontSize(40)
    .fillColor(colors.gold)
    .text("☾", 0, 70, { width: doc.page.width, align: "center" });
  doc
    .font(fonts.bold)
    .fontSize(27)
    .fillColor(colors.cream)
    .text(labels.lullaby, 55, 145, {
      width: doc.page.width - 110,
      align: "center",
    });
  doc
    .font(fonts.regular)
    .fontSize(17)
    .fillColor(colors.cream)
    .text(story.lullaby, 80, 245, {
      width: doc.page.width - 160,
      align: "center",
      lineGap: 11,
    });
  doc.roundedRect(70, 545, doc.page.width - 140, 140, 20).fill(colors.deepBlue);
  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor(colors.gold)
    .text(`${story.guardianStar.toUpperCase()} ${labels.whispers}`, 90, 575, {
      width: doc.page.width - 180,
      align: "center",
      characterSpacing: 1,
    });
  doc
    .font(fonts.regular)
    .fontSize(12.5)
    .fillColor(colors.cream)
    .text(story.starMessage, 95, 615, {
      width: doc.page.width - 190,
      align: "center",
      lineGap: 5,
    });
}

function drawClosingPage({ doc, fonts, story, profile, labels }) {
  doc.addPage();
  fillPage(doc, colors.cream);
  doc
    .font(fonts.bold)
    .fontSize(38)
    .fillColor(colors.gold)
    .text("✦", 0, 60, { width: doc.page.width, align: "center" });
  doc
    .font(fonts.bold)
    .fontSize(24)
    .fillColor(colors.midnight)
    .text(`${labels.closingTitle} ${profile.childName},`, 55, 125, {
      width: doc.page.width - 110,
      align: "center",
    });
  doc
    .font(fonts.regular)
    .fontSize(14)
    .fillColor(colors.text)
    .text(labels.closingText, 68, 190, {
      width: doc.page.width - 136,
      align: "center",
      lineGap: 7,
    });
  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor(colors.gold)
    .text(labels.closingBrand, 0, 750, {
      width: doc.page.width,
      align: "center",
      characterSpacing: 1.2,
    });
}

async function createPdf({ profile, story, imagePaths, outputPath }) {
  const labels = getLocalizedLabels(profile.storyLanguage);
  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    bufferPages: true,
    info: {
      Title: `${profile.childName} - ` + `${story.title}`,
      Author: "Star Child Tales",
      Subject: "Personalized Storybook",
    },
  });
  const fonts = registerFonts(doc);
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  drawCover({ doc, fonts, story, imagePath: imagePaths[0], profile, labels });
  drawManifestoPage({ doc, fonts, profile, story, labels });
  drawGuardianStarPage({ doc, fonts, story, labels });
  story.illustrations.forEach((page, index) => {
    drawIllustratedPage({
      doc,
      fonts,
      page,
      imagePath: imagePaths[index],
      pageNumber: index + 1,
    });
  });
  drawLullabyPage({ doc, fonts, story, labels });
  drawClosingPage({ doc, fonts, story, profile, labels });
  doc.end();
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

async function createStarPackage({ profile, story }) {
  if (
    !Array.isArray(story?.illustrations) ||
    story.illustrations.length !== 10
  ) {
    throw new Error("Paket oluşturmak için tam 10 resimli sayfa gereklidir.");
  }
  const childSlug = safeFileName(profile.childName);
  const rootDirectory = path.join(
    __dirname,
    "..",
    "generated",
    "premium",
    childSlug,
  );
  const imagesDirectory = path.join(rootDirectory, "images");
  const booksDirectory = path.join(rootDirectory, "books");
  const audioDirectory = path.join(rootDirectory, "audio");
  const videoDirectory = path.join(rootDirectory, "video");
  createDirectory(rootDirectory);
  createDirectory(imagesDirectory);
  createDirectory(booksDirectory);
  createDirectory(audioDirectory);
  createDirectory(videoDirectory);
  fs.writeFileSync(
    path.join(rootDirectory, "story.json"),
    JSON.stringify(story, null, 2),
    "utf8",
  );
  const imagePaths = [];
  // Karakter süreklilik düzeltmesi: ilk sayfanın ve bir önceki
  // sayfanın gerçek görselini, sonraki her sayfa üretimine referans
  // olarak veriyoruz. Böylece model karakteri metinden "hayal etmek"
  // yerine doğrudan görüp koruyabiliyor.
  let firstPageImagePath = null;
  let previousPageImagePath = null;

  for (let index = 0; index < story.illustrations.length; index += 1) {
    const page = story.illustrations[index];
    const fileName =
      `${childSlug}_sayfa_` + `${String(index + 1).padStart(2, "0")}.png`;
    const expectedPath = path.join(
      __dirname,
      "..",
      "generated",
      "images",
      fileName,
    );
    console.log(` ${index + 1}/10. resim hazırlanıyor: ` + `${page.title}`);
    if (!fs.existsSync(expectedPath)) {
      const referenceImagePaths = [
        firstPageImagePath,
        previousPageImagePath,
      ].filter(
        (referencePath, refIndex, all) =>
          referencePath && all.indexOf(referencePath) === refIndex,
      );

      await generateIllustration({
        prompt: page.prompt,
        fileName,
        referenceImagePaths,
      });
    } else {
      console.log("   ↳ Resim zaten var, yeniden üretilmedi.");
    }
    const copiedPath = path.join(imagesDirectory, fileName);
    fs.copyFileSync(expectedPath, copiedPath);
    imagePaths.push(copiedPath);

    if (index === 0) {
      firstPageImagePath = expectedPath;
    }
    previousPageImagePath = expectedPath;
  }
  const pdfPath = path.join(
    booksDirectory,
    `${childSlug}_Star_Child_Tales.pdf`,
  );
  console.log(" PDF hazırlanıyor...");
  await createPdf({ profile, story, imagePaths, outputPath: pdfPath });
  let speechResult = null;
  if (profile.voiceEnabled !== false) {
    console.log("️ Seslendirme hazırlanıyor...");
    speechResult = await createStorySpeech({
      profile,
      story,
      outputDirectory: audioDirectory,
    });
  }
  // Video artık ana paket akışını bloklamıyor. PDF ve ses hazır
  // olur olmaz paket cevabı hemen döner; video ayrı bir arka plan
  // görevi (videoJobId) olarak başlatılır ve durumu video_job_store
  // üzerinden /video-status/:jobId ile takip edilir.
  //
  // ÖNEMLİ: audioPath yoksa (voiceEnabled=false ya da seslendirme
  // başarısız olduysa) video üretilemez, çünkü createStoryVideo
  // seslendirme dosyasını zorunlu tutuyor. Bu durumda video görevi
  // hiç başlatılmaz.
  //
  // DÜZELTME (aynı anda birden fazla video görevi çakışması):
  // videoJobStore.createJob() artık zaten devam eden bir görev varsa
  // hata fırlatıyor (bkz. video_job_store.js). Bu hatayı burada
  // yakalıyoruz ki art arda gelen istekler tüm paketi (PDF + ses
  // dahil) çökertmesin — sadece video adımı atlanır, kullanıcı yine
  // PDF ve sesi alır.
  //
  // ENABLE_VIDEO=false iken (Remotion Lambda kurulana kadar) video
  // görevi hiç başlatılmaz; videoStatus "disabled" olarak döner ve
  // Flutter tarafı video seçeneğini "Yakında" olarak gösterebilir.
  let videoJobId = null;
  let videoStatus = "unavailable";

  if (!ENABLE_VIDEO) {
    videoStatus = "disabled";
    console.log(
      "🎬 Video oluşturma şu an devre dışı (ENABLE_VIDEO=false). PDF ve ses paketi normal şekilde dönüyor.",
    );
  } else if (speechResult?.outputPath && fs.existsSync(speechResult.outputPath)) {
    try {
      videoJobId = videoJobStore.createJob();
      videoStatus = "processing";
      videoJobStore.updateJob(videoJobId, { status: "processing" });

      console.log(`️ Video arka planda başlatılıyor (job: ${videoJobId})...`);

      createStoryVideo({
        profile,
        story,
        imagePaths,
        audioPath: speechResult.outputPath,
        outputDirectory: videoDirectory,
        onProgress: (percentage) => {
          videoJobStore.updateJob(videoJobId, {
            status: "processing",
            progress: percentage,
          });
        },
      })
        .then((videoResult) => {
          videoJobStore.updateJob(videoJobId, {
            status: "ready",
            progress: 100,
            videoPath: videoResult.outputPath,
            videoFileName: videoResult.fileName,
            error: null,
          });
          console.log(`✅ Video görevi tamamlandı (job: ${videoJobId}).`);
        })
        .catch((error) => {
          // Video hatası (Render zaman aşımı dahil) yalnızca video
          // görevini "failed" yapar; PDF ve ses paketini bozmaz.
          console.error(
            `⚠️ Video görevi başarısız oldu (job: ${videoJobId}):`,
            error?.message || error,
          );
          videoJobStore.updateJob(videoJobId, {
            status: "failed",
            error: error?.message || "Bilinmeyen video hatası.",
          });
        });
    } catch (videoStartError) {
      console.warn(
        `⚠️ Video başlatılamadı, muhtemelen zaten bir video hazırlanıyor: ${videoStartError.message}`,
      );
      videoJobId = null;
      videoStatus = "busy";
    }
  } else {
    console.log(
      "ℹ️ Seslendirme bulunmadığı için video görevi başlatılmadı.",
    );
  }

  return {
    rootDirectory,
    imagePaths,
    pdfPath,
    audioPath: speechResult?.outputPath || null,
    audioFileName: speechResult?.fileName || null,
    videoJobId,
    videoStatus,
    disclosure: speechResult?.disclosure || null,
  };
}

module.exports = { createStarPackage };