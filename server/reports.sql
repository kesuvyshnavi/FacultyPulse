-- (5c) Reference subquery examples against the live FacultyPulse schema.
-- Run these in MySQL Workbench once feedback has been submitted through
-- the app, to see real results instead of placeholder numbers.

-- Faculty whose average rating is above the department-wide average
SELECT faculty_name, AVG(rating) AS avg_rating
FROM feedback
GROUP BY faculty_name
HAVING AVG(rating) > (SELECT AVG(rating) FROM feedback);

-- Students who have NOT yet submitted feedback for a given subject
SELECT id, name
FROM users
WHERE role = 'student'
  AND id NOT IN (
    SELECT student_id FROM feedback WHERE subject_id = 'fsd'
  );

-- Subjects with more submitted feedback than the average subject
SELECT subject_name, COUNT(*) AS responses
FROM feedback
GROUP BY subject_name
HAVING COUNT(*) > (
  SELECT AVG(subject_count) FROM (
    SELECT COUNT(*) AS subject_count FROM feedback GROUP BY subject_id
  ) AS counts
);
