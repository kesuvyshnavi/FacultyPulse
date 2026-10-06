-- (5a) Create a database and tables inside it
CREATE DATABASE IF NOT EXISTS facultypulse;
USE facultypulse;

-- (5d) This whole file is the script file created for the MySQL client /
-- MySQL Workbench, holding schema plus baseline subject data together.

-- department/program/year are only used for student accounts (a student's
-- B.Tech/M.Tech/MCA/MBA program, department, and year of study), which is
-- what the Admin portal's "Manage Students" filters are built on. They're
-- nullable because faculty/admin accounts don't use them.
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role ENUM('student', 'faculty', 'admin') NOT NULL,
  department VARCHAR(100) NULL,
  program VARCHAR(20) NULL,
  year INT NULL,
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

-- Feedback stores the full 8-category / 46-question breakdown as JSON
-- (`answers`), plus the separate overall star rating and three optional
-- comment boxes. `rating` is kept as a plain INT column (= overall_rating)
-- so existing subqueries in reports.sql keep working unchanged.
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id VARCHAR(20) NOT NULL,
  subject_name VARCHAR(150) NOT NULL,
  faculty_name VARCHAR(100) NOT NULL,
  student_id VARCHAR(20) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  answers JSON NOT NULL,
  rating INT NOT NULL,           -- overall star rating, 1-5
  strengths TEXT,
  improvements TEXT,
  suggestions TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  -- (5c-adjacent) one submission per student per subject PER FACULTY —
  -- a subject can have more than one faculty, and the student reviews
  -- each of them separately.
  UNIQUE KEY unique_student_subject_faculty (student_id, subject_id, faculty_name)
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

-- ---------------------------------------------------------------------
-- MIGRATING AN EXISTING DATABASE (skip this if you're starting fresh)
-- ---------------------------------------------------------------------
-- If your `users` table doesn't yet have department/program/year:
--
--   ALTER TABLE users
--     ADD COLUMN department VARCHAR(100) NULL AFTER role,
--     ADD COLUMN program VARCHAR(20) NULL AFTER department,
--     ADD COLUMN year INT NULL AFTER program;
--
-- If your `feedback` table still has the old single `rating`/`comments`
-- shape (no `answers` JSON column), see the migration note in the
-- previous version of this file, or simply:
--
--   TRUNCATE TABLE feedback;
--   -- then run the CREATE TABLE feedback statement above manually,
--   -- after DROP TABLE feedback; if TRUNCATE doesn't match the new shape.