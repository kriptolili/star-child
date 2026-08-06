require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { createStoryBookPlan } = require("./services/story_service");
const { createStarBook } = require("./services/pdf_service");
const { createStorySpeech } = require("./services/speech_service");
const { createStarPackage } = require("./services/package_service");
const videoJobStore = require("./services/video_job_store");
const app = express();
const port = Number(process.env.PORT || 3000);
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/generated", express.static(path.join(__dirname, "generated")));
app.get("/", (_req, res) => {
  res.send(" Star Child API çalışıyor.");
});
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "star-child-backend", version: "1.5.0" });
});
function createProfileFromRequest(body = {}) {
  const {
    childName,
    birthDate,
    birthTime,
    birthPlace,
    appearanceMode = "auto",
    appearanceRegion = "auto",
    storyLanguage = "auto",
    photoProvided = false,
    voiceEnabled = true,
    musicEnabled = true,
  } = body;
  return {
    childName: typeof childName === "string" ? childName.trim() : "",
    birthDate: typeof birthDate === "string" ? birthDate.trim() : "",
    birthTime: typeof birthTime === "string" ? birthTime.trim() : "",
    birthPlace: typeof birthPlace === "string" ? birthPlace.trim() : "",
    appearanceMode:
      typeof appearanceMode === "string" ? appearanceMode.trim() : "auto",
    appearanceRegion:
      typeof appearanceRegion === "string" ? appearanceRegion.trim() : "auto",
    storyLanguage:
      typeof storyLanguage === "string" ? storyLanguage.trim() : "auto",
    photoProvided: photoProvided === true,
    voiceEnabled: voiceEnabled !== false,
    musicEnabled: musicEnabled !== false,
  };
}
function validateProfile(profile) {
  if (
    !profile.childName ||
    !profile.birthDate ||
    !profile.birthTime ||
    !profile.birthPlace
  ) {
    return (
      "Çocuğun adı, doğum tarihi, doğum saati " + "ve doğum yeri gereklidir."
    );
  }
  const validAppearanceModes = ["auto", "custom"];
  const validAppearanceRegions = [
    "auto",
    "east_asia",
    "south_asia",
    "africa",
    "europe",
    "middle_east",
    "latin_america",
    "mixed",
  ];
  const validLanguages = [
    "auto",
    "tr",
    "en",
    "de",
    "fr",
    "es",
    "pt",
    "ar",
    "hi",
    "ja",
    "ko",
    "zh",
  ];
  if (!validAppearanceModes.includes(profile.appearanceMode)) {
    return "Geçersiz kahraman görünümü seçimi.";
  }
  if (!validAppearanceRegions.includes(profile.appearanceRegion)) {
    return "Geçersiz görünüm bölgesi seçimi.";
  }
  if (!validLanguages.includes(profile.storyLanguage)) {
    return "Geçersiz masal dili seçimi.";
  }
  if (
    profile.appearanceMode === "custom" &&
    profile.appearanceRegion === "auto"
  ) {
    return "Lütfen kahramanın görünüm bölgesini seçin.";
  }
  return null;
}
function generatedFileUrl(req, absolutePath) {
  if (!absolutePath) {
    return null;
  }
  const generatedDirectory = path.join(__dirname, "generated");
  const relativePath = path
    .relative(generatedDirectory, absolutePath)
    .split(path.sep)
    .map(encodeURIComponent)
    .join("/");
  return (
    `${req.protocol}://` + `${req.get("host")}/generated/` + `${relativePath}`
  );
}
app.post("/story", async (req, res) => {
  try {
    const profile = createProfileFromRequest(req.body);
    const validationError = validateProfile(profile);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    console.log(` ${profile.childName} için masal hazırlanıyor...`);
    console.log(
      ` Görünüm: ${profile.appearanceMode} / ` + `${profile.appearanceRegion}`,
    );
    console.log(` Masal dili: ${profile.storyLanguage}`);
    console.log(
      ` Fotoğraf seçildi: ` + `${profile.photoProvided ? "Evet" : "Hayır"}`,
    );
    const story = await createStoryBookPlan(profile);
    return res.json(story);
  } catch (error) {
    console.error("Masal oluşturma hatası:", error);
    return res
      .status(500)
      .json({
        error:
          "Masal ve resimli kitap sayfaları " +
          "hazırlanırken bir sorun oluştu.",
      });
  }
});
app.post("/speech", async (req, res) => {
  try {
    const { profile: rawProfile, story } = req.body ?? {};
    if (!rawProfile || !story) {
      return res
        .status(400)
        .json({ error: "Seslendirme için profil ve masal verisi gereklidir." });
    }
    const speechProfile = {
      childName:
        typeof rawProfile.childName === "string"
          ? rawProfile.childName.trim()
          : "",
      storyLanguage:
        typeof rawProfile.storyLanguage === "string"
          ? rawProfile.storyLanguage.trim()
          : "auto",
      voiceEnabled: rawProfile.voiceEnabled !== false,
    };
    if (!speechProfile.childName) {
      return res.status(400).json({ error: "Çocuğun adı gereklidir." });
    }
    if (
      !Array.isArray(story.illustrations) ||
      story.illustrations.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Seslendirilecek masal sayfaları bulunamadı." });
    }
    const outputDirectory = path.join(__dirname, "generated", "audio");
    console.log(
      `️ ${speechProfile.childName} için ` + "seslendirme hazırlanıyor...",
    );
    const speechResult = await createStorySpeech({
      profile: speechProfile,
      story,
      outputDirectory,
    });
    if (!speechResult) {
      return res.json({
        message: "Seslendirme kullanıcı tercihiyle kapatıldı.",
        audioUrl: null,
        fileName: null,
        disclosure: "Bu seslendirme yapay zekâ tarafından oluşturulmuştur.",
      });
    }
    console.log(`✅ Seslendirme hazır: ` + `${speechResult.outputPath}`);
    return res.json({
      message: "Masal seslendirmen hazır.",
      audioUrl: generatedFileUrl(req, speechResult.outputPath),
      fileName: speechResult.fileName,
      disclosure: speechResult.disclosure,
    });
  } catch (error) {
    console.error("Seslendirme oluşturma hatası:", error);
    return res
      .status(500)
      .json({ error: "Masal seslendirilirken bir sorun oluştu." });
  }
});
app.post("/package", async (req, res) => {
  try {
    const { profile: rawProfile, story } = req.body ?? {};
    if (!rawProfile || !story) {
      return res
        .status(400)
        .json({
          error: "Paket oluşturmak için profil ve masal verisi gereklidir.",
        });
    }
    const profile = createProfileFromRequest(rawProfile);
    const validationError = validateProfile(profile);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    console.log(
      ` ${profile.childName} için ` + "Star Child paketi hazırlanıyor...",
    );
    const packageResult = await createStarPackage({ profile, story });
    console.log(
      `✅ Star Child paketi hazır: ` + `${packageResult.rootDirectory}`,
    );
    return res.json({
      message: "Yıldız paketin hazır.",
      pdfUrl: generatedFileUrl(req, packageResult.pdfPath),
      audioUrl: generatedFileUrl(req, packageResult.audioPath),
      imageUrls: packageResult.imagePaths.map((imagePath) =>
        generatedFileUrl(req, imagePath),
      ),
      // Video artık paketle birlikte beklenmiyor; ayrı bir arka plan
      // görevi olarak çalışıyor. Durumu /video-status/:jobId ile
      // sorgulanmalı. videoUrl burada her zaman null döner.
      videoJobId: packageResult.videoJobId,
      videoStatus: packageResult.videoStatus,
      videoUrl: null,
      disclosure: packageResult.disclosure,
    });
  } catch (error) {
    console.error("Star Child paketi oluşturma hatası:", error);
    return res
      .status(500)
      .json({
        error:
          "Resimler, PDF, ses ve video hazırlanırken " + "bir sorun oluştu.",
      });
  }
});
app.get("/video-status/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = videoJobStore.getJob(jobId);

  if (!job) {
    return res.status(404).json({
      error: "Bu video görevi bulunamadı.",
    });
  }

  return res.json({
    status: job.status,
    videoUrl:
      job.status === "ready"
        ? generatedFileUrl(req, job.videoPath)
        : null,
    progress: job.progress ?? 0,
    error: job.status === "failed" ? job.error : null,
  });
});

app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
