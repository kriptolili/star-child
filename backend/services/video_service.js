const fs = require("fs");
const path = require("path");
const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");

const VIDEO_TIMEOUT_MS = 10 * 60 * 1000;

function createDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, {
    recursive: true,
  });
}

function safeFileName(value) {
  return String(value || "star_child")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function createStoryVideo({
  profile,
  story,
  imagePaths,
  audioPath,
  outputDirectory,
  onProgress,
}) {
  if (!profile?.childName) {
    throw new Error("Video oluşturmak için çocuk adı gereklidir.");
  }

  if (
    !Array.isArray(story?.illustrations) ||
    story.illustrations.length !== 10
  ) {
    throw new Error("Video oluşturmak için tam 10 resimli sayfa gereklidir.");
  }

  if (!Array.isArray(imagePaths) || imagePaths.length !== 10) {
    throw new Error(
      "Video oluşturmak için tam 10 resim dosyası gereklidir."
    );
  }

  if (!audioPath || !fs.existsSync(audioPath)) {
    throw new Error(`Video seslendirmesi bulunamadı: ${audioPath}`);
  }

  const backendDirectory = path.join(__dirname, "..");
  const remotionDirectory = path.join(backendDirectory, "video");
  const publicDirectory = path.join(remotionDirectory, "public");

  createDirectory(publicDirectory);
  createDirectory(outputDirectory);

  const childSlug = safeFileName(profile.childName);

  const pages = story.illustrations.map((page, index) => {
    const sourcePath = imagePaths[index];

    if (!sourcePath || !fs.existsSync(sourcePath)) {
      throw new Error(`Video resmi bulunamadı: ${sourcePath}`);
    }

    const extension = path.extname(sourcePath) || ".png";
    const publicFileName =
      `${childSlug}_video_sayfa_` +
      `${String(index + 1).padStart(2, "0")}` +
      `${extension}`;
    const destinationPath = path.join(publicDirectory, publicFileName);

    fs.copyFileSync(sourcePath, destinationPath);

    return {
      title: typeof page.title === "string" ? page.title : "",
      text: typeof page.text === "string" ? page.text : "",
      image: publicFileName,
    };
  });

  const audioExtension = path.extname(audioPath) || ".mp3";
  const audioFileName = `${childSlug}_video_narration${audioExtension}`;
  const publicAudioPath = path.join(publicDirectory, audioFileName);

  fs.copyFileSync(audioPath, publicAudioPath);

  // DÜZELTME: `.isNotEmpty` bir Dart özelliğidir, JavaScript'te yoktur.
  // Bu satır olduğu haliyle her zaman TypeError fırlatıp videoyu
  // baştan çökertiyordu. String uzunluğu üzerinden kontrol edilmeli.
  const hasGuardianStar =
    typeof story.guardianStar === "string" &&
    story.guardianStar.trim().length > 0;

  const inputProps = {
    childName: profile.childName,
    guardianStar: hasGuardianStar ? story.guardianStar : "Stella",
    pages,
    audioFile: audioFileName,
  };

  const outputPath = path.join(
    outputDirectory,
    `${childSlug}_Star_Journey.mp4`
  );

  try {
    console.log(" Video dosyaları ve ses hazırlanıyor...");

    const bundleLocation = await bundle({
      entryPoint: path.join(remotionDirectory, "src", "Root.jsx"),
      publicDir: publicDirectory,
    });

    console.log(" Video kompozisyonu yükleniyor...");

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "StarChildVideo",
      inputProps,
      timeoutInMilliseconds: VIDEO_TIMEOUT_MS,
      chromiumOptions: {
        enableMultiProcessOnLinux: false,
      },
    });

    console.log("✨ Seslendirmeli video oluşturuluyor...");

    let lastPercentage = -1;

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      audioCodec: "aac",
      outputLocation: outputPath,
      inputProps,
      concurrency: 1,
      timeoutInMilliseconds: VIDEO_TIMEOUT_MS,
      chromiumOptions: {
        enableMultiProcessOnLinux: false,
      },
      onProgress: ({ progress }) => {
        const percentage = Math.round(progress * 100);

        if (percentage === lastPercentage) {
          return;
        }

        lastPercentage = percentage;
        console.log(` Video ilerlemesi: %${percentage}`);

        // Job store'u güncellemek için ilerlemeyi çağırana ilet.
        // package_service.js bu callback'i video_job_store'a bağlar.
        if (typeof onProgress === "function") {
          onProgress(percentage);
        }
      },
    });

    if (!fs.existsSync(outputPath)) {
      throw new Error(
        "Video işlemi tamamlandı ancak MP4 dosyası bulunamadı."
      );
    }

    console.log(`✅ Seslendirmeli video hazır: ${outputPath}`);

    return {
      outputPath,
      fileName: path.basename(outputPath),
    };
  } catch (error) {
    if (fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath);
      } catch (_) {
        // Yarım video silinemese bile asıl hata korunur.
      }
    }

    console.error("⚠️ Video oluşturulamadı:", error?.message || error);

    // Bu hata (Render zaman aşımı dahil) çağırana (package_service)
    // iletilir; orada video görevi "failed" olarak işaretlenir,
    // ancak PDF/ses paketi bundan hiç etkilenmez.
    throw new Error(
      `Video oluşturulamadı: ${error?.message || "Bilinmeyen video hatası."}`
    );
  }
}

module.exports = {
  createStoryVideo,
};
