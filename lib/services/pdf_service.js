const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const COLORS = {
  midnight: "#11102F",
  deepBlue: "#1B1947",
  cream: "#FFF8E9",
  gold: "#E8B975",
  lavender: "#B9A6D9",
  softText: "#514A68",
  white: "#FFFFFF",
};

function findFirstExistingPath(paths) {
  return paths.find((candidate) => fs.existsSync(candidate)) ?? null;
}
function registerFonts(doc) {
  const projectFontsDirectory = path.join(
    __dirname,
    "..",
    "fonts"
  );

  const cjkRegularFont = path.join(
    projectFontsDirectory,
    "NotoSerifCJKsc-Regular.otf"
  );

  const regularFont = findFirstExistingPath([
    cjkRegularFont,
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
  ]);

  const boldFont = findFirstExistingPath([
    cjkRegularFont,
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
  ]);

  if (regularFont) {
    doc.registerFont(
      "StarBody",
      regularFont
    );
  }

  if (boldFont) {
    doc.registerFont(
      "StarBold",
      boldFont
    );
  }

  return {
    regular:
      regularFont
        ? "StarBody"
        : "Helvetica",

    bold:
      boldFont
        ? "StarBold"
        : "Helvetica-Bold",
  };
}

function addPageNumber(doc, fonts) {
  const pageNumber = doc.bufferedPageRange().count;

  doc
    .font(fonts.regular)
    .fontSize(8)
    .fillColor("#978EAA")
    .text(String(pageNumber), 0, doc.page.height - 28, {
      width: doc.page.width,
      align: "center",
    });
}

function addSmallStars(doc) {
  const stars = [
    [55, 62, 2],
    [520, 80, 1.5],
    [470, 155, 1],
    [90, 235, 1.4],
    [520, 420, 2],
    [70, 690, 1.4],
    [480, 745, 1.2],
  ];

  doc.save();

  for (const [x, y, radius] of stars) {
    doc.circle(x, y, radius).fill(COLORS.gold);
  }

  doc.restore();
}

function drawCover(doc, fonts, profile, story, coverImagePath) {
  if (coverImagePath && fs.existsSync(coverImagePath)) {
    doc.image(coverImagePath, 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
      fit: [doc.page.width, doc.page.height],
      align: "center",
      valign: "center",
    });

    doc
      .save()
      .rect(0, 0, doc.page.width, doc.page.height)
      .fillOpacity(0.36)
      .fill(COLORS.midnight)
      .restore();
  } else {
    addDarkBackground(doc);
    addSmallStars(doc);
  }

  doc
    .font(fonts.bold)
    .fontSize(16)
    .fillColor(COLORS.cream)
    .text(`${profile.childName}'nın`, 55, 92, {
      width: doc.page.width - 110,
      align: "center",
    });

  doc
    .font(fonts.bold)
    .fontSize(34)
    .fillColor(COLORS.white)
    .text("YILDIZ KİTABI", 45, 122, {
      width: doc.page.width - 90,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(12)
    .fillColor(COLORS.lavender)
    .text("KORUYUCU YILDIZI", 60, 190, {
      width: doc.page.width - 120,
      align: "center",
      characterSpacing: 1.5,
    });

  doc
    .font(fonts.bold)
    .fontSize(27)
    .fillColor(COLORS.gold)
    .text(story.guardianStar, 50, 215, {
      width: doc.page.width - 100,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(12)
    .fillColor(COLORS.cream)
    .text(
      "Gökyüzünün ilhamıyla,\nyalnızca onun için hazırlandı.",
      70,
      doc.page.height - 120,
      {
        width: doc.page.width - 140,
        align: "center",
        lineGap: 5,
      }
    );

  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor(COLORS.gold)
    .text("STAR CHILD", 0, doc.page.height - 48, {
      width: doc.page.width,
      align: "center",
      characterSpacing: 2,
    });
}

function drawManifestoPage(doc, fonts, profile, story) {
  doc.addPage();
  addDarkBackground(doc);
  addSmallStars(doc);

  doc
    .font(fonts.bold)
    .fontSize(42)
    .fillColor(COLORS.gold)
    .text("✦", 0, 100, {
      width: doc.page.width,
      align: "center",
    });

  doc
    .font(fonts.bold)
    .fontSize(23)
    .fillColor(COLORS.cream)
    .text(
      "Her çocuk, yalnızca kendisi için yazılmış bir yıldız hikâyesiyle dünyaya gelir.",
      65,
      180,
      {
        width: doc.page.width - 130,
        align: "center",
        lineGap: 9,
      }
    );

  doc
    .font(fonts.regular)
    .fontSize(15)
    .fillColor(COLORS.lavender)
    .text(
      "Bu Yıldız Kitabı, o eşsiz hikâyenin gökyüzünden ilham alan ilk satırlarıdır.",
      82,
      330,
      {
        width: doc.page.width - 164,
        align: "center",
        lineGap: 7,
      }
    );

  doc
    .font(fonts.bold)
    .fontSize(18)
    .fillColor(COLORS.gold)
    .text(profile.childName, 0, 470, {
      width: doc.page.width,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(12)
    .fillColor(COLORS.cream)
    .text(
      `${profile.birthDate} • ${profile.birthTime}\n${profile.birthPlace}`,
      70,
      510,
      {
        width: doc.page.width - 140,
        align: "center",
        lineGap: 6,
      }
    );

  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor(COLORS.lavender)
    .text("STAR CHILD", 0, 690, {
      width: doc.page.width,
      align: "center",
      characterSpacing: 2,
    });
}

function drawGuardianStarPage(doc, fonts, story, inspirationStar) {
  doc.addPage();
  addCreamBackground(doc);

  doc
    .font(fonts.bold)
    .fontSize(13)
    .fillColor(COLORS.lavender)
    .text("KORUYUCU YILDIZIN", 60, 75, {
      width: doc.page.width - 120,
      align: "center",
      characterSpacing: 1.4,
    });

  doc
    .font(fonts.bold)
    .fontSize(34)
    .fillColor(COLORS.midnight)
    .text(story.guardianStar, 50, 110, {
      width: doc.page.width - 100,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(16)
    .fillColor(COLORS.softText)
    .text(story.guardianStarMeaning, 72, 175, {
      width: doc.page.width - 144,
      align: "center",
      lineGap: 7,
    });

  doc
    .roundedRect(70, 285, doc.page.width - 140, 230, 22)
    .fill(COLORS.deepBlue);

  doc
    .font(fonts.regular)
    .fontSize(12)
    .fillColor(COLORS.lavender)
    .text("İLHAM ALDIĞI GERÇEK YILDIZ", 90, 320, {
      width: doc.page.width - 180,
      align: "center",
      characterSpacing: 1,
    });

  doc
    .font(fonts.bold)
    .fontSize(27)
    .fillColor(COLORS.gold)
    .text(inspirationStar, 90, 355, {
      width: doc.page.width - 180,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(14)
    .fillColor(COLORS.cream)
    .text(
      `${story.guardianStar}, ${inspirationStar}'un parlaklığından ilham alan Star Child evreninin hayali yıldız dostudur.`,
      105,
      410,
      {
        width: doc.page.width - 210,
        align: "center",
        lineGap: 6,
      }
    );

  addPageNumber(doc, fonts);
}

function drawOpeningPage(doc, fonts, story, coverImagePath) {
  doc.addPage();
  addCreamBackground(doc);

  if (coverImagePath && fs.existsSync(coverImagePath)) {
    doc.image(coverImagePath, 54, 55, {
      fit: [doc.page.width - 108, 350],
      align: "center",
      valign: "center",
    });
  }

  doc
    .font(fonts.bold)
    .fontSize(20)
    .fillColor(COLORS.midnight)
    .text("Doğum Anının Işığı", 60, 430, {
      width: doc.page.width - 120,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(14)
    .fillColor(COLORS.softText)
    .text(story.openingNote, 68, 480, {
      width: doc.page.width - 136,
      align: "center",
      lineGap: 7,
    });

  addPageNumber(doc, fonts);
}

function drawStoryPages(doc, fonts, story) {
  const paragraphs = story.story
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  doc.addPage();
  addCreamBackground(doc);

  doc
    .font(fonts.bold)
    .fontSize(27)
    .fillColor(COLORS.midnight)
    .text(story.title, 55, 60, {
      width: doc.page.width - 110,
      align: "center",
      lineGap: 5,
    });

  let y = 145;

  for (const paragraph of paragraphs) {
    doc.font(fonts.regular).fontSize(13.5);

    const paragraphHeight = doc.heightOfString(paragraph, {
      width: doc.page.width - 120,
      lineGap: 6,
    });

    if (y + paragraphHeight > doc.page.height - 75) {
      addPageNumber(doc, fonts);
      doc.addPage();
      addCreamBackground(doc);
      y = 65;
    }

    doc
      .fillColor(COLORS.softText)
      .text(paragraph, 60, y, {
        width: doc.page.width - 120,
        align: "left",
        lineGap: 6,
      });

    y += paragraphHeight + 18;
  }

  addPageNumber(doc, fonts);
}

function drawLullabyPage(doc, fonts, story) {
  doc.addPage();
  addDarkBackground(doc);
  addSmallStars(doc);

  doc
    .font(fonts.bold)
    .fontSize(39)
    .fillColor(COLORS.gold)
    .text("☾", 0, 70, {
      width: doc.page.width,
      align: "center",
    });

  doc
    .font(fonts.bold)
    .fontSize(26)
    .fillColor(COLORS.cream)
    .text("Yıldız Ninnisi", 55, 135, {
      width: doc.page.width - 110,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(17)
    .fillColor(COLORS.cream)
    .text(story.lullaby, 85, 225, {
      width: doc.page.width - 170,
      align: "center",
      lineGap: 11,
    });

  doc
    .roundedRect(75, 510, doc.page.width - 150, 145, 20)
    .fill(COLORS.deepBlue);

  doc
    .font(fonts.bold)
    .fontSize(12)
    .fillColor(COLORS.gold)
    .text(`${story.guardianStar.toUpperCase()} FISILDIYOR`, 95, 540, {
      width: doc.page.width - 190,
      align: "center",
      characterSpacing: 1,
    });

  doc
    .font(fonts.regular)
    .fontSize(13)
    .fillColor(COLORS.cream)
    .text(story.starMessage, 100, 580, {
      width: doc.page.width - 200,
      align: "center",
      lineGap: 6,
    });
}

function drawClosingPage(doc, fonts, profile, story, inspirationStar) {
  doc.addPage();
  addCreamBackground(doc);

  doc
    .font(fonts.bold)
    .fontSize(38)
    .fillColor(COLORS.gold)
    .text("✦", 0, 65, {
      width: doc.page.width,
      align: "center",
    });

  doc
    .font(fonts.bold)
    .fontSize(24)
    .fillColor(COLORS.midnight)
    .text(`Sevgili ${profile.childName},`, 58, 125, {
      width: doc.page.width - 116,
      align: "center",
    });

  const closingText =
    `Bu Yıldız Kitabı, dünyaya geldiğin o eşsiz anda gökyüzünün ` +
    `ilhamıyla yalnızca senin için hazırlandı.\n\n` +
    `Belki bugün bu satırları sana seni çok seven biri okuyacak. ` +
    `Belki yıllar sonra bu kitabı kendi ellerinle yeniden açacaksın.\n\n` +
    `O gün geldiğinde çocukluğunun hayal gücünü, ilk gülüşlerini ve ` +
    `bu sayfalarda saklı sıcaklığı yeniden bulmanı dileriz.\n\n` +
    `Koruyucu yıldızın ${story.guardianStar}, ${inspirationStar}'un ` +
    `parlaklığından ilham alan hayali yıldız dostun olarak çıktığınız ` +
    `her yeni yolculukta sana merakı, cesareti ve umudu hatırlatsın.\n\n` +
    `Bu kitap kapanabilir...\nAma yıldız dostluğunuz hiç bitmeyecek.`;

  doc
    .font(fonts.regular)
    .fontSize(14)
    .fillColor(COLORS.softText)
    .text(closingText, 68, 185, {
      width: doc.page.width - 136,
      align: "center",
      lineGap: 7,
    });

  doc
    .font(fonts.bold)
    .fontSize(16)
    .fillColor(COLORS.midnight)
    .text(
      "Star Child Dünyası'nda masallar hiçbir zaman sona ermez.",
      65,
      610,
      {
        width: doc.page.width - 130,
        align: "center",
      }
    );

  doc
    .font(fonts.regular)
    .fontSize(12)
    .fillColor(COLORS.lavender)
    .text(
      "Çünkü her çocuk, gökyüzünden ilham alan benzersiz bir hikâyedir.",
      78,
      655,
      {
        width: doc.page.width - 156,
        align: "center",
      }
    );

  doc
    .font(fonts.bold)
    .fontSize(12)
    .fillColor(COLORS.gold)
    .text("SEVGİYLE, STAR CHILD", 0, 740, {
      width: doc.page.width,
      align: "center",
      characterSpacing: 1.3,
    });
}

async function createStarBook({
  profile,
  story,
  coverImagePath,
  inspirationStar = "Sirius",
}) {
  const booksDirectory = path.join(__dirname, "..", "generated", "books");
  fs.mkdirSync(booksDirectory, { recursive: true });

  const fileName =
    `${sanitizeFileName(profile.childName)}_Yildiz_Kitabi.pdf`;

  const outputPath = path.join(booksDirectory, fileName);

  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    bufferPages: true,
    info: {
      Title: `${profile.childName}'nın Yıldız Kitabı`,
      Author: "Star Child",
      Subject: "Kişisel Yıldız Kitabı",
    },
  });

  const fonts = registerFonts(doc);
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  drawCover(doc, fonts, profile, story, coverImagePath);
  drawManifestoPage(doc, fonts, profile, story);
  drawGuardianStarPage(doc, fonts, story, inspirationStar);
  drawOpeningPage(doc, fonts, story, coverImagePath);
  drawStoryPages(doc, fonts, story);
  drawLullabyPage(doc, fonts, story);
  drawClosingPage(doc, fonts, profile, story, inspirationStar);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return outputPath;
}

module.exports = {
  createStarBook,
};