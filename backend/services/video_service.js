const fs = require("fs");
const path = require("path");

const { bundle } = require("@remotion/bundler");
const {
  renderMedia,
  selectComposition,
} = require("@remotion/renderer");

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
}) {
  if (!profile?.childName) {
    throw new Error(
      "Video oluşturmak için çocuk adı gereklidir."
    );
  }

  if (
    !Array.isArray(story?.illustrations) ||
    story.illustrations.length !== 10
  ) {
    throw new Error(
      "Video oluşturmak için tam 10 resimli sayfa gereklidir."
    );
  }

  if (
    !Array.isArray(imagePaths) ||
    imagePaths.length !== 10
  ) {
    throw new Error(
      "Video oluşturmak için tam 10 resim dosyası gereklidir."
    );
  }

  if (
    !audioPath ||
    !fs.existsSync(audioPath)
  ) {
    throw new Error(
      `Video seslendirmesi bulunamadı: ${audioPath}`
    );
  }

  const backendDirectory = path.join(
    __dirname,
    ".."
  );

  const remotionDirectory = path.join(
    backendDirectory,
    "video"
  );

  const publicDirectory = path.join(
    remotionDirectory,
    "public"
  );

  createDirectory(publicDirectory);
  createDirectory(outputDirectory);

  const childSlug = safeFileName(
    profile.childName
  );

  const pages = story.illustrations.map(
    (page, index) => {
      const sourcePath = imagePaths[index];

      if (
        !sourcePath ||
        !fs.existsSync(sourcePath)
      ) {
        throw new Error(
          `Video resmi bulunamadı: ${sourcePath}`
        );
      }

      const extension =
        path.extname(sourcePath) || ".png";

      const publicFileName =
        `${childSlug}_video_sayfa_` +
        `${String(index + 1).padStart(2, "0")}` +
        `${extension}`;

      const destinationPath = path.join(
        publicDirectory,
        publicFileName
      );

      fs.copyFileSync(
        sourcePath,
        destinationPath
      );

      return {
        title:
          typeof page.title === "string"
            ? page.title
            : "",

        text:
          typeof page.text === "string"
            ? page.text
            : "",

        image: publicFileName,
      };
    }
  );

  const audioExtension =
    path.extname(audioPath) || ".mp3";

  const audioFileName =
    `${childSlug}_video_narration` +
    `${audioExtension}`;

  const publicAudioPath = path.join(
    publicDirectory,
    audioFileName
  );

  fs.copyFileSync(
    audioPath,
    publicAudioPath
  );

  const inputProps = {
    childName: profile.childName,

    guardianStar:
      typeof story.guardianStar === "string" &&
      story.guardianStar.trim().isNotEmpty
        ? story.guardianStar
        : "Stella",

    pages,
    audioFile: audioFileName,
  };

  console.log(
    "📦 Video files and narration are being prepared..."
  );

  const bundleLocation = await bundle({
    entryPoint: path.join(
      remotionDirectory,
      "src",
      "Root.jsx"
    ),

    publicDir: publicDirectory,
  });

  const composition =
    await selectComposition({
      serveUrl: bundleLocation,
      id: "StarChildVideo",
      inputProps,
    });

  const outputPath = path.join(
    outputDirectory,
    `${childSlug}_Star_Journey.mp4`
  );

  console.log(
    "✨ Creating your narrated animated story..."
  );

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    audioCodec: "aac",
    outputLocation: outputPath,
    inputProps,

    chromiumOptions: {
      enableMultiProcessOnLinux: true,
    },

    onProgress: ({ progress }) => {
      const percentage =
        Math.round(progress * 100);

      process.stdout.write(
        `\r🎞️ Creating narrated video: %${percentage}`
      );
    },
  });

  console.log("");

  console.log(
    `✅ Narrated video is ready: ${outputPath}`
  );

  return {
    outputPath,
    fileName: path.basename(outputPath),
  };
}

module.exports = {
  createStoryVideo,
};