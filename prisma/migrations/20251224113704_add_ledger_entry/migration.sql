CREATE TABLE ledger_entries (
  id VARCHAR(191) NOT NULL,
  barberId VARCHAR(191) NOT NULL,
  appointmentRequestId VARCHAR(191) NULL,
  date VARCHAR(191) NOT NULL,
  customerName VARCHAR(255) NOT NULL,
  description TEXT NULL,
  amount DECIMAL(10,2) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ledger_entries_barberId_date_idx (barberId, date),
  KEY ledger_entries_date_idx (date),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE ledger_entries
  ADD CONSTRAINT ledger_entries_barberId_fkey
  FOREIGN KEY (barberId) REFERENCES barbers(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE ledger_entries
  ADD CONSTRAINT ledger_entries_appointmentRequestId_fkey
  FOREIGN KEY (appointmentRequestId) REFERENCES appointment_requests(id)
  ON DELETE SET NULL ON UPDATE CASCADE;

