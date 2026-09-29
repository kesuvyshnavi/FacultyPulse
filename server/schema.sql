-- (5a) Create a database and tables inside it
CREATE DATABASE IF NOT EXISTS facultypulse;
USE facultypulse;

-- (5d) This whole file is the script file created for the MySQL client /
-- MySQL Workbench, holding schema plus baseline subject data together.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role ENUM('student', 'faculty', 'admin') NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS subject_faculty (
  subject_id VARCHAR(20) NOT NULL,
  faculty_name VARCHAR(100) NOT NULL,
  PRIMARY KEY (subject_id, faculty_name),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id VARCHAR(20) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  faculty_name VARCHAR(100) NOT NULL,
  student_id VARCHAR(20) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL,
  comments TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  -- (5c-adjacent) one submission per student per subject, enforced at the
  -- database level, not just in the API
  UNIQUE KEY unique_student_subject (student_id, subject_id)
);

-- (5b) Insert data via the MySQL client: subjects, and which faculty teach
-- each one. INSERT IGNORE so re-running this file is safe.
INSERT IGNORE INTO subjects (id, name) VALUES
  ('fsd', 'Full Stack Development'),
  ('java', 'Java Programming'),
  ('python', 'Python Programming'),
  ('dbms', 'Database Management Systems');

INSERT IGNORE INTO subject_faculty (subject_id, faculty_name) VALUES
  ('fsd', 'Dr. Ramesh'),
  ('fsd', 'Dr. Anitha Rao'),
  ('java', 'Dr. Priya Menon'),
  ('java', 'Dr. Suresh Kumar'),
  ('python', 'Dr. Ramesh'),
  ('python', 'Dr. Priya Menon'),
  ('dbms', 'Dr. Suresh Kumar'),
  ('dbms', 'Dr. Anitha Rao');

-- User accounts (students/faculty/admin) are NOT seeded here, on purpose —
-- their passwords need to be bcrypt-hashed, which only Node can do.
-- Run `npm run seed` after this file to create the starting accounts.
