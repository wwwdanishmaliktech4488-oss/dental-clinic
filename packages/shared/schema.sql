CREATE TABLE IF NOT EXISTS clinics (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  opening_hours JSON,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  clinic_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('receptionist','manager','admin') NOT NULL DEFAULT 'receptionist',
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_clinic_email (clinic_id, email),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

CREATE TABLE IF NOT EXISTS treatments (
  id CHAR(36) PRIMARY KEY,
  clinic_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  images JSON,
  pricing_note VARCHAR(500),
  published BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_clinic_slug (clinic_id, slug),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

CREATE TABLE IF NOT EXISTS enquiries (
  id CHAR(36) PRIMARY KEY,
  clinic_id CHAR(36) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  preferred_contact_method ENUM('email','phone') DEFAULT 'email',
  preferred_contact_time VARCHAR(100),
  preferred_date DATE,
  treatment_id CHAR(36),
  message TEXT,
  consent_granted BOOLEAN NOT NULL,
  consent_version VARCHAR(20),
  consent_timestamp TIMESTAMP,
  status ENUM('new','contacted','follow_up_required','appointment_requested','converted','closed') DEFAULT 'new',
  assigned_to CHAR(36),
  source VARCHAR(50) DEFAULT 'website',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clinic_status_created (clinic_id, status, created_at),
  INDEX idx_clinic_email (clinic_id, email),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (treatment_id) REFERENCES treatments(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id CHAR(36) PRIMARY KEY,
  clinic_id CHAR(36) NOT NULL,
  enquiry_id CHAR(36) NOT NULL,
  assigned_to CHAR(36),
  due_at DATETIME NOT NULL,
  type VARCHAR(50),
  status ENUM('pending','done','cancelled') DEFAULT 'pending',
  completed_at DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_clinic_due_status (clinic_id, due_at, status),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (enquiry_id) REFERENCES enquiries(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id CHAR(36) PRIMARY KEY,
  clinic_id CHAR(36) NOT NULL,
  actor_id CHAR(36),
  record_type VARCHAR(50) NOT NULL,
  record_id CHAR(36) NOT NULL,
  action VARCHAR(50) NOT NULL,
  before_json JSON,
  after_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_record (record_type, record_id),
  INDEX idx_clinic_created (clinic_id, created_at)
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id CHAR(36) PRIMARY KEY,
  clinic_id CHAR(36) NOT NULL,
  enquiry_id CHAR(36),
  type VARCHAR(50),
  recipient VARCHAR(255),
  status ENUM('sent','failed','pending') DEFAULT 'pending',
  provider_id VARCHAR(255),
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);