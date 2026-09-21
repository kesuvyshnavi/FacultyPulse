-- (5a) Create a database and tables inside it using the MySQL client
CREATE DATABASE IF NOT EXISTS facultypulse;
USE facultypulse;

CREATE TABLE IF NOT EXISTS faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT,
  student_name VARCHAR(100),
  rating INT,
  comments TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id)
);

-- (5b) Create table, insert data, update data in the MySQL command-line client
INSERT INTO faculty (name, subject) VALUES
  ('Dr. Ramesh', 'Full Stack Development'),
  ('Dr. Priya', 'Java Programming'),
  ('Dr. Suresh', 'Python');

UPDATE faculty SET subject = 'Advanced Full Stack Development'
  WHERE name = 'Dr. Ramesh';

-- Sample feedback rows so the subquery below has data to work with
INSERT INTO feedback (faculty_id, student_name, rating, comments) VALUES
  (1, 'Vyshu', 5, 'Very clear explanations.'),
  (1, 'Anil', 4, 'Good pace, more examples would help.'),
  (2, 'Sara', 3, 'Sometimes too fast.'),
  (3, 'Ravi', 5, 'Excellent hands-on sessions.');

-- (5c) Subquery example: faculty whose average rating is above the
-- overall average rating across all faculty
SELECT name FROM faculty
WHERE id IN (
  SELECT faculty_id FROM feedback
  GROUP BY faculty_id
  HAVING AVG(rating) > (SELECT AVG(rating) FROM feedback)
);

-- (5d) This whole file is the script file created in the MySQL workbench /
-- command-line client, holding both schema and sample data together.

-- (5e) To initialize the database and wire it into the API:
--   1. Run:  mysql -u root -p < schema.sql
--   2. Update the password in server/db.js to match your local MySQL setup
--   3. Start the server:  cd server && npm install && npm run dev
--   4. The /api/feedback routes in feedbackRoutes.js now read/write this DB
