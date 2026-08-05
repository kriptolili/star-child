const fs = require("fs");
const path = require("path");

const { bundle } = require("@remotion/bundler");
const {
  renderMedia,
  selectComposition,
} = require("@remotion/renderer");

async function renderStarChildVideo() {
  try {
    console.log("🎬 Star Child videosu hazırlanıyor...");

    const backendDirectory = path.join(__dirname, "..");

    const storyPath = path.join(
      backendDirectory,
      "generated",
      "premium",
      "Mila",
      "story.json"
    );

    const sourceImagesDirectory = path.join(
      backendDirectory,
      "generated",
      "images"
    );

    const publicDirectory = path.join(__dirname, "public");

    const outputDirectory = path.join(
      backendDirectory,
      "generated",
      "videos"
    );

    fs.mkdirSync(publicDirectory, { recursive: true });
    fs.mkdirSync(outputDirectory, { recursive: true });

    if (!fs.existsSync(storyPath)) {
      throw new Error(`Masal dosyası bulunamadı: ${storyPath}`);
    }

    const story = JSON.parse(
      fs.readFileSync(storyPath, "utf8")
    );

    if (
      !Array.isArray(story.illustrations) ||
      story.illustrations.length !== 10
    ) {
      throw new Error("Masalda tam 10 resimli sayfa bulunamadı.");
    }

    const pages = story.illustrations.map((page, index) => {
      const fileName =
        `Mila_sayfa_${String(index + 1).padStart(2, "0")}.png`;

      const sourcePath = path.join(
        sourceImagesDirectory,
        fileName
      );

      const destinationPath = path.join(
        publicDirectory,
        fileName
      );

      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Resim bulunamadı: ${sourcePath}`);
      }

      fs.copyFileSync(sourcePath, destinationPath);

      return {
        title: page.title,
        text: page.text,
        image: fileName,
      };
    });

    const inputProps = {
      childName: "Mila",
      guardianStar: story.guardianStar || "Veyla",
      pages,
    };

    console.log("📦 Video dosyaları paketleniyor...");

    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, "src", "Root.jsx"),
      publicDir: publicDirectory,
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "StarChildVideo",
      inputProps,
    });

    const outputPath = path.join(
      outputDirectory,
      "Mila_Yildiz_Yolculugu.mp4"
    );

    console.log("✨ Masal sayfaları canlandırılıyor...");

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      chromiumOptions: {
        enableMultiProcessOnLinux: true,
      },
      onProgress: ({ progress }) => {
        const percentage = Math.round(progress * 100);
        process.stdout.write(`\r🎞️ Video oluşturuluyor: %${percentage}`);
      },
    });

    console.log("");
    console.log("✅ Yıldız videon hazır:");
    console.log(outputPath);
  } catch (error) {
    console.error("");
    console.error("❌ Video oluşturulamadı:");
    console.error(error);
    process.exitCode = 1;
  }
}

renderStarChildVideo();