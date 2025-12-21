CREATE TABLE barbers (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','barber') NOT NULL DEFAULT 'barber',
  experience INT NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  specialties TEXT NULL,
  image VARCHAR(500) NULL,
  slotDuration INT NOT NULL DEFAULT 30,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY barbers_email_key (email),
  KEY barbers_email_idx (email),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE working_hours (
  id VARCHAR(191) NOT NULL,
  barberId VARCHAR(191) NOT NULL,
  dayOfWeek INT NOT NULL,
  startTime VARCHAR(10) NOT NULL,
  endTime VARCHAR(10) NOT NULL,
  isWorking BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY working_hours_barberId_dayOfWeek_key (barberId, dayOfWeek),
  KEY working_hours_barberId_idx (barberId),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE appointment_requests (
  id VARCHAR(191) NOT NULL,
  barberId VARCHAR(191) NOT NULL,
  customerName VARCHAR(255) NOT NULL,
  customerPhone VARCHAR(20) NOT NULL,
  customerEmail VARCHAR(255) NULL,
  date VARCHAR(191) NOT NULL,
  requestedStartTime VARCHAR(191) NOT NULL,
  requestedEndTime VARCHAR(191) NULL,
  status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY appointment_requests_barberId_date_idx (barberId, date),
  KEY appointment_requests_status_idx (status),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE appointment_slots (
  id VARCHAR(191) NOT NULL,
  barberId VARCHAR(191) NOT NULL,
  appointmentRequestId VARCHAR(191) NULL,
  date VARCHAR(191) NOT NULL,
  startTime VARCHAR(191) NOT NULL,
  endTime VARCHAR(191) NOT NULL,
  status ENUM('blocked','free') NOT NULL DEFAULT 'blocked',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY appointment_slots_barberId_date_idx (barberId, date),
  KEY appointment_slots_barberId_date_status_idx (barberId, date, status),
  KEY appointment_slots_status_idx (status),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE working_hours
  ADD CONSTRAINT working_hours_barberId_fkey
  FOREIGN KEY (barberId) REFERENCES barbers(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE appointment_requests
  ADD CONSTRAINT appointment_requests_barberId_fkey
  FOREIGN KEY (barberId) REFERENCES barbers(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE appointment_slots
  ADD CONSTRAINT appointment_slots_barberId_fkey
  FOREIGN KEY (barberId) REFERENCES barbers(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE appointment_slots
  ADD CONSTRAINT appointment_slots_appointmentRequestId_fkey
  FOREIGN KEY (appointmentRequestId) REFERENCES appointment_requests(id)
  ON DELETE SET NULL ON UPDATE CASCADE;
