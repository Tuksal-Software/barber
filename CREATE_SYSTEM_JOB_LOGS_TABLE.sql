CREATE TABLE system_job_logs (
  id VARCHAR(191) NOT NULL,
  jobName VARCHAR(100) NOT NULL,
  ranAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  meta JSON NULL,
  PRIMARY KEY (id),
  INDEX idx_job_name (jobName),
  INDEX idx_ran_at (ranAt)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

