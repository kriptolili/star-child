const crypto = require("crypto");

const jobs = new Map();

const VALID_STATUSES = ["pending", "processing", "ready", "failed"];
const STALE_JOB_MS = 15 * 60 * 1000; // 15 dakikadan eski, bitmemis isler "stuck" sayilir

function hasActiveJob() {
  for (const job of jobs.values()) {
    if (job.status === "pending" || job.status === "processing") {
      const age = Date.now() - job.updatedAt;
      if (age < STALE_JOB_MS) {
        return true;
      }
    }
  }
  return false;
}

function createJob() {
  if (hasActiveJob()) {
    throw new Error(
      "Zaten devam eden bir video gorevi var. Lutfen tamamlanmasini bekleyin.",
    );
  }

  const jobId = `ezel-${crypto.randomUUID()}`;

  jobs.set(jobId, {
    status: "pending",
    progress: 0,
    videoPath: null,
    videoFileName: null,
    error: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return jobId;
}

function updateJob(jobId, updates = {}) {
  const existing = jobs.get(jobId);

  if (!existing) {
    return null;
  }

  if (updates.status && !VALID_STATUSES.includes(updates.status)) {
    throw new Error(`Gecersiz video gorev durumu: ${updates.status}`);
  }

  const updated = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  jobs.set(jobId, updated);
  return updated;
}

function getJob(jobId) {
  return jobs.get(jobId) || null;
}

module.exports = {
  createJob,
  updateJob,
  getJob,
  hasActiveJob,
};
