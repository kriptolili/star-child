const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { generateColoringPage } = require("./coloring_service");
const { uploadToR2 } = require("./r2Client");

function createDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function sanitizeFileName(value) {
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
  // Aynı bundled font kullanılıyor (package_service.js ile tutarlı),
  // Türkçe karakterler için macOS'a özel yollara bağımlı olmamak
  // adına.
  const bundledFontPath = path.join(
    __dirname,
    "..",
    "fonts",
    "NotoSans-Regular.ttf",
  );

  if (fs.existsSync(bundledFontPath)) {
    doc.registerFont("ColoringBody", bundledFontPath);
    doc.registerFont("ColoringBold", bundledFontPath);
    return { regular: "ColoringBody", bold: "ColoringBold" };
  }

  const fallbackFontPath = findExistingFont([
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
  ]);

  if (fallbackFontPath) {
    doc.registerFont("ColoringBody", fallbackFontPath);
    doc.registerFont("ColoringBold", fallbackFontPath);
  }

  return {
    regular: fallbackFontPath ? "ColoringBody" : "Helvetica",
    bold: fallbackFontPath ? "ColoringBold" : "Helvetica-Bold",
  };
}

function getLocalizedLabels(languageCode) {
  const labels = {
    tr: {
      title: "BOYAMA KİTABI",
      subtitle: "Fırçalarını ve boya kalemlerini hazırla!",
    },
    en: {
      title: "COLORING BOOK",
      subtitle: "Grab your crayons and markers!",
    },
    es: {
      title: "LIBRO DE COLOREAR",
      subtitle: "¡Prepara tus lápices de colores!",
    },
  };

  return labels[languageCode] || labels.en;
}

function drawCoverPage({ doc, fonts, profile, labels }) {
  doc
    .save()
    .rect(0, 0, doc.page.width, doc.page.height)
    .fill("#FFF8EA")
    .restore();

  doc
    .font(fonts.bold)
    .fontSize(40)
    .fillColor("#E9B86E")
    .text("✎", 0, 130, { width: doc.page.width, align: "center" });

  doc
    .font(fonts.bold)
    .fontSize(30)
    .fillColor("#171432")
    .text(labels.title, 50, 220, {
      width: doc.page.width - 100,
      align: "center",
    });

  doc
    .font(fonts.bold)
    .fontSize(18)
    .fillColor("#514B63")
    .text(profile.childName, 0, 290, {
      width: doc.page.width,
      align: "center",
    });

  doc
    .font(fonts.regular)
    .fontSize(12)
    .fillColor("#958CA3")
    .text(labels.subtitle, 60, 340, {
      width: doc.page.width - 120,
      align: "center",
    });
}

function drawColoringPage({ doc, imagePath, pageNumber }) {
  doc.addPage();
  doc
    .save()
    .rect(0, 0, doc.page.width, doc.page.height)
    .fill("#FFFFFF")
    .restore();

  doc.image(imagePath, 35, 35, {
    fit: [doc.page.width - 70, doc.page.height - 90],
    align: "center",
    valign: "center",
  });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#CCCCCC")
    .text(String(pageNumber), 0, doc.page.height - 27, {
      width: doc.page.width,
      align: "center",
    });
}

/**
 * Daha önce üretilmiş renkli sayfalardan siyah-beyaz bir boyama
 * kitabı PDF'i oluşturur.
 *
 * Bu fonksiyon, `createStarPackage()` çalışıp renkli görseller
 * diskte hazır olduktan SONRA, ayrı bir istekle (talep üzerine)
 * çağrılmak üzere tasarlandı.
 *
 * @param {object} params
 * @param {object} params.profile - Çocuk profili (childName,
 *   storyLanguage vb.).
 * @param {object} params.story - Masal verisi (illustrations dizisi
 *   dahil).
 * @param {string[]} params.colorImagePaths - Zaten üretilmiş 10
 *   renkli sayfanın disk yolları (sırayla).
 */
async function createColoringBook({ profile, story, colorImagePaths }) {
  if (
    !Array.isArray(colorImagePaths) ||
    colorImagePaths.length !== 10
  ) {
    throw new Error(
      "Boyama kitabı için tam 10 renkli sayfa gereklidir. " +
        "Önce Yıldız Paketi hazırlanmış olmalı.",
    );
  }

  const childSlug = sanitizeFileName(profile.childName);

  const rootDirectory = path.join(
    __dirname,
    "..",
    "generated",
    "premium",
    childSlug,
  );
  const coloringImagesDirectory = path.join(
    rootDirectory,
    "coloring",
    "images",
  );
  const coloringBooksDirectory = path.join(rootDirectory, "coloring");

  createDirectory(coloringImagesDirectory);
  createDirectory(coloringBooksDirectory);

  const coloringImagePaths = [];

  for (let index = 0; index < colorImagePaths.length; index += 1) {
    const colorImagePath = colorImagePaths[index];
    const fileName =
      `${childSlug}_boyama_` +
      `${String(index + 1).padStart(2, "0")}.png`;
    const expectedPath = path.join(coloringImagesDirectory, fileName);

    console.log(
      `✎ ${index + 1}/10. boyama sayfası hazırlanıyor...`,
    );

    if (!fs.existsSync(expectedPath)) {
      await generateColoringPage({
        colorImagePath,
        fileName,
        outputDirectory: coloringImagesDirectory,
      });
    } else {
      console.log("   ↳ Boyama sayfası zaten var, yeniden üretilmedi.");
    }

    coloringImagePaths.push(expectedPath);
  }

  const labels = getLocalizedLabels(profile.storyLanguage);
  const pdfPath = path.join(
    coloringBooksDirectory,
    `${childSlug}_Coloring_Book.pdf`,
  );

  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    bufferPages: true,
    info: {
      Title: `${profile.childName} - Coloring Book`,
      Author: "Star Child Tales",
      Subject: "Personalized Coloring Book",
    },
  });

  const fonts = registerFonts(doc);
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  drawCoverPage({ doc, fonts, profile, labels });

  coloringImagePaths.forEach((imagePath, index) => {
    drawColoringPage({ doc, imagePath, pageNumber: index + 1 });
  });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  console.log(`✅ Boyama kitabı hazır: ${pdfPath}`);

  const r2Key = `generated/premium/${childSlug}/coloring/${path.basename(pdfPath)}`;
  let r2Url = null;

  try {
    r2Url = await uploadToR2(pdfPath, r2Key, "application/pdf");
    console.log(`☁️  R2'ye yüklendi: ${r2Url}`);
  } catch (uploadError) {
    console.error(
      "⚠️ R2 yüklemesi başarısız, local path kullanılacak:",
      uploadError.message,
    );
  }

  return {
    pdfPath,
    fileName: path.basename(pdfPath),
    imagePaths: coloringImagePaths,
    r2Url,
  };
}

module.exports = {
  createColoringBook,
};
