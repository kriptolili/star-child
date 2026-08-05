const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function sanitizeFileName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function createSimpleStarBook({ profile, story }) {
  const booksDirectory = path.join(__dirname, "..", "generated", "books");
  fs.mkdirSync(booksDirectory, { recursive: true });

  const outputPath = path.join(
    booksDirectory,
    `${sanitizeFileName(profile.childName)}_Yildiz_Kitabi.pdf`
  );

  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: `${profile.childName}'nın Yıldız Kitabı`,
      Author: "Star Child",
    },
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  doc.fontSize(26).text(`${profile.childName}'nın Yıldız Kitabı`, {
    align: "center",
  });

  doc.moveDown();
  doc.fontSize(16).text(`Koruyucu yıldız: ${story.guardianStar}`, {
    align: "center",
  });

  doc.moveDown();
  doc.fontSize(12).text(story.openingNote, { align: "center" });

  for (const page of story.illustrations) {
    doc.addPage();
    doc.fontSize(20).text(page.title, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(page.text, { align: "left" });
    doc.moveDown();
    doc.fontSize(10).fillColor("#666666").text(page.caption, {
      align: "center",
    });
    doc.fillColor("#000000");
  }

  doc.addPage();
  doc.fontSize(20).text("Yıldız Ninnisi", { align: "center" });
  doc.moveDown();
  doc.fontSize(13).text(story.lullaby, { align: "center" });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return outputPath;
}

module.exports = {
  createSimpleStarBook,
};
