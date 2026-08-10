require("dotenv").config();

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const {
  createStoryBookPlan,
} = require("./services/story_service");

const {
  generateIllustration,
} = require("./services/image_service");

const profile = {
  childName: "Mila",
  birthDate: "2021-05-16",
  birthTime: "14:35",
  birthPlace: "İstanbul, Türkiye",
};

const colors = {
  midnight: "#171432",
  deepBlue: "#252050",
  cream: "#FFF8EA",
  gold: "#E9B86E",
  lavender: "#BBA9D8",
  text: "#514B63",
  white: "#FFFFFF",
};

function createDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, {
    recursive: true,
  });
}

function safeFileName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function findExistingFont(paths) {
  return paths.find((fontPath) => fs.existsSync(fontPath)) || null;
}

function registerFonts(doc) {
  const regularFontPath = findExistingFont([
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
  ]);

  const boldFontPath = findExistingFont([
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
  ]);

  if (regularFontPath) {
    doc.registerFont("StarBody", regularFontPath);
  }

  if (boldFontPath) {
    doc.registerFont("StarBold", boldFontPath);
  }

  return {
    regular: regularFontPath ? "StarBody" : "Helvetica",
    bold: boldFontPath ? "StarBold" : "Helvetica-Bold",
  };
}

function fillPage(doc, color) {
  doc
    .save()
    .rect(0, 0, doc.page.width, doc.page.height)
    .fill(color)
    .restore();
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
    doc
      .circle(x, y, radius)
      .fill(colors.gold);
  }

  doc.restore();
}

function drawCover(doc, fonts, story, imagePath) {
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
    .text(`${profile.childName}'nın`, 50, 80, {
      width: doc.page.width - 100,
      align: "center",
    });

  doc
    .font(fonts.bold)
    .fontSize(35)
    .fillColor(colors.white)
    .text("YILDIZ KİTABI", 40, 115, {
      width: doc.page.width - 80,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor(colors.lavender)
    .text("KORUYUCU YILDIZI", 70, 185, {
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
    .text(
      `${story.inspirationStar} yıldızının ışığından ilham alan\nhayali yıldız dostu`,
      70,
      260,
      {
        width: doc.page.width - 140,
        align: "center",
        lineGap: 4,
      }
    );

  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor(colors.cream)
    .text(
      "Gökyüzünün ilhamıyla,\nyalnızca Mila için hazırlandı.",
      70,
      doc.page.height - 115,
      {
        width: doc.page.width - 140,
        align: "center",
        lineGap: 5,
      }
    );

  doc
    .font(fonts.bold)
    .fontSize(10)
    .fillColor(colors.gold)
    .text("STAR CHILD", 0, doc.page.height - 45, {
      width: doc.page.width,
      align: "center",
      characterSpacing: 2,
    });
}

function drawManifestoPage(doc, fonts) {
  doc.addPage();
  fillPage(doc, colors.midnight);
  addStars(doc);

  doc
    .font(fonts.bold)
    .fontSize(42)
    .fillColor(colors.gold)
    .text("✦", 0, 105, {
      width: doc.page.width,
      align: "center",
    });

  doc
    .font(fonts.bold)
    .fontSize(24)
    .fillColor(colors.cream)
    .text(
      "Her çocuk, yalnızca kendisi için yazılmış bir yıldız hikâyesiyle dünyaya gelir.",
      65,
      200,
      {
        width: doc.page.width - 130,
        align: "center",
        lineGap: 9,
      }
    );

  doc
    .font(fonts.regular)
    .fontSize(15)
    .fillColor(colors.lavender)
    .text(
      "Bu Yıldız Kitabı, o eşsiz hikâyenin gökyüzünden ilham alan ilk satırlarıdır.",
      80,
      365,
      {
        width: doc.page.width - 160,
        align: "center",
        lineGap: 7,
      }
    );

  doc
    .font(fonts.bold)
    .fontSize(18)
    .fillColor(colors.gold)
    .text(profile.childName, 0, 515, {
      width: doc.page.width,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(12)
    .fillColor(colors.cream)
    .text(
      `${profile.birthDate} • ${profile.birthTime}\n${profile.birthPlace}`,
      70,
      555,
      {
        width: doc.page.width - 140,
        align: "center",
        lineGap: 5,
      }
    );
}

function drawGuardianStarPage(doc, fonts, story) {
  doc.addPage();
  fillPage(doc, colors.cream);

  doc
    .font(fonts.bold)
    .fontSize(13)
    .fillColor(colors.lavender)
    .text("KORUYUCU YILDIZIN", 65, 80, {
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

  doc
    .roundedRect(
      65,
      310,
      doc.page.width - 130,
      230,
      24
    )
    .fill(colors.deepBlue);

  doc
    .font(fonts.regular)
    .fontSize(11)
    .fillColor(colors.lavender)
    .text("İLHAM ALDIĞI GERÇEK YILDIZ", 90, 345, {
      width: doc.page.width - 180,
      align: "center",
      characterSpacing: 1,
    });

  doc
    .font(fonts.bold)
    .fontSize(29)
    .fillColor(colors.gold)
    .text(story.inspirationStar, 90, 385, {
      width: doc.page.width - 180,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(14)
    .fillColor(colors.cream)
    .text(
      `${story.guardianStar}, ${story.inspirationStar} yıldızının parlaklığından ilham alan Star Child evreninin hayali yıldız dostudur.`,
      100,
      445,
      {
        width: doc.page.width - 200,
        align: "center",
        lineGap: 6,
      }
    );
}

function drawIllustratedPage(
  doc,
  fonts,
  page,
  imagePath,
  pageNumber
) {
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

function drawLullabyPage(doc, fonts, story) {
  doc.addPage();
  fillPage(doc, colors.midnight);
  addStars(doc);

  doc
    .font(fonts.bold)
    .fontSize(40)
    .fillColor(colors.gold)
    .text("☾", 0, 70, {
      width: doc.page.width,
      align: "center",
    });

  doc
    .font(fonts.bold)
    .fontSize(27)
    .fillColor(colors.cream)
    .text("Yıldız Ninnisi", 55, 145, {
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

  doc
    .roundedRect(
      70,
      545,
      doc.page.width - 140,
      140,
      20
    )
    .fill(colors.deepBlue);

  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor(colors.gold)
    .text(
      `${story.guardianStar.toUpperCase()} FISILDIYOR`,
      90,
      575,
      {
        width: doc.page.width - 180,
        align: "center",
        characterSpacing: 1,
      }
    );

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

function drawClosingPage(doc, fonts, story) {
  doc.addPage();
  fillPage(doc, colors.cream);

  doc
    .font(fonts.bold)
    .fontSize(38)
    .fillColor(colors.gold)
    .text("✦", 0, 60, {
      width: doc.page.width,
      align: "center",
    });

  doc
    .font(fonts.bold)
    .fontSize(24)
    .fillColor(colors.midnight)
    .text(`Sevgili ${profile.childName},`, 55, 125, {
      width: doc.page.width - 110,
      align: "center",
    });

  const closingText =
    `Bu Yıldız Kitabı, dünyaya geldiğin o eşsiz anda ` +
    `gökyüzünün ilhamıyla yalnızca senin için hazırlandı.\n\n` +
    `Belki bugün bu satırları sana seni çok seven biri okuyacak. ` +
    `Belki yıllar sonra bu kitabı kendi ellerinle yeniden açacaksın.\n\n` +
    `O gün geldiğinde çocukluğunun hayal gücünü, ilk gülüşlerini ` +
    `ve bu sayfalarda saklı sıcaklığı yeniden bulmanı dileriz.\n\n` +
    `Dost yıldızın ${story.guardianStar}, ` +
    `${story.inspirationStar} yıldızının parlaklığından ilham alan ` +
    `hayali yıldız dostun olarak çıktığınız her yeni yolculukta ` +
    `sana merakı, cesareti ve umudu hatırlatsın.\n\n` +
    `Bu kitap kapanabilir...\n` +
    `Ama yıldız dostluğunuz hiç bitmeyecek.`;

  doc
    .font(fonts.regular)
    .fontSize(14)
    .fillColor(colors.text)
    .text(closingText, 68, 190, {
      width: doc.page.width - 136,
      align: "center",
      lineGap: 7,
    });

  doc
    .font(fonts.bold)
    .fontSize(15)
    .fillColor(colors.midnight)
    .text(
      "Star Child Dünyası'nda masallar hiçbir zaman sona ermez.",
      65,
      650,
      {
        width: doc.page.width - 130,
        align: "center",
      }
    );

  doc
    .font(fonts.bold)
    .fontSize(11)
    .fillColor(colors.gold)
    .text("SEVGİYLE, STAR CHILD", 0, 750, {
      width: doc.page.width,
      align: "center",
      characterSpacing: 1.2,
    });
}

async function createPdf(story, imagePaths, outputPath) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    bufferPages: true,
    info: {
      Title: `${profile.childName}'nın Yıldız Kitabı`,
      Author: "Star Child",
      Subject: "Kişisel Resimli Yıldız Kitabı",
    },
  });

  const fonts = registerFonts(doc);
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  drawCover(doc, fonts, story, imagePaths[0]);
  drawManifestoPage(doc, fonts);
  drawGuardianStarPage(doc, fonts, story);

  story.illustrations.forEach((page, index) => {
    drawIllustratedPage(
      doc,
      fonts,
      page,
      imagePaths[index],
      index + 1
    );
  });

  drawLullabyPage(doc, fonts, story);
  drawClosingPage(doc, fonts, story);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

async function main() {
  try {
    console.log("📚 Mila'nın 10 sayfalık masalı hazırlanıyor...");

    const story = await createStoryBookPlan(profile);

    if (
      !Array.isArray(story.illustrations) ||
      story.illustrations.length !== 10
    ) {
      throw new Error(
        "Masal planında tam 10 resimli sayfa bulunamadı."
      );
    }

    const rootDirectory = path.join(
      __dirname,
      "generated",
      "premium",
      safeFileName(profile.childName)
    );

    const imagesDirectory = path.join(
      rootDirectory,
      "images"
    );

    const booksDirectory = path.join(
      rootDirectory,
      "books"
    );

    createDirectory(imagesDirectory);
    createDirectory(booksDirectory);

    fs.writeFileSync(
      path.join(rootDirectory, "story.json"),
      JSON.stringify(story, null, 2),
      "utf8"
    );

    const imagePaths = [];

    for (
      let index = 0;
      index < story.illustrations.length;
      index += 1
    ) {
      const page = story.illustrations[index];

      const fileName =
        `${safeFileName(profile.childName)}_` +
        `sayfa_${String(index + 1).padStart(2, "0")}.png`;

      const expectedPath = path.join(
        __dirname,
        "generated",
        "images",
        fileName
      );

      console.log(
        `🎨 ${index + 1}/10. resim hazırlanıyor: ${page.title}`
      );

      if (!fs.existsSync(expectedPath)) {
        await generateIllustration({
          prompt: page.prompt,
          fileName,
        });
      } else {
        console.log("   ↳ Resim zaten var, yeniden üretilmedi.");
      }

      imagePaths.push(expectedPath);
    }

    const pdfPath = path.join(
      booksDirectory,
      `${safeFileName(profile.childName)}_Premium_Yildiz_Kitabi.pdf`
    );

    console.log("📖 Resimler Yıldız Kitabı'na yerleştiriliyor...");

    await createPdf(
      story,
      imagePaths,
      pdfPath
    );

    console.log("");
    console.log(
      "✨ Gökyüzünün ilhamı resimlere ve sayfalara dokundu."
    );
    console.log("✅ Premium Yıldız Kitabın hazır:");
    console.log(pdfPath);
  } catch (error) {
    console.error("");
    console.error(
      "❌ Premium Yıldız Kitabı oluşturulamadı:"
    );
    console.error(error);
    process.exitCode = 1;
  }
}

main();