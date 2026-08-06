const crypto = require("crypto");

const jobs = new Map();

const VALID_STATUSES = ["pending", "processing", "ready", "failed"];

function createJob() {
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
};
