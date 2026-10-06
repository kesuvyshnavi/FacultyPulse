// Default password rule set by the HOD when registering someone:
// the user's name, lowercased, with spaces removed. Used both to seed the
// initial accounts below and to generate credentials for anyone the HOD
// registers later from the Admin portal's Register tab.
export function defaultPasswordFor(name) {
  return name.toLowerCase().replace(/\s+/g, "");
}

// NOTE: subjects and which faculty teach them are no longer a static list
// here — the HOD can reassign a faculty member to different subjects each
// semester from the Admin portal, so every portal (Student, Faculty,
// Admin) now fetches the current subject/faculty list from
// GET /api/subjects instead of importing a fixed array. See
// StudentPortal.jsx and AdminPortal.jsx.

// A "review" is one student reviewing one faculty member for one subject.
// Because a subject can have several faculty, reviews (not subjects) are
// what a student completes and what the HOD's response rate is based on.
export function reviewKey(subjectId, faculty) {
  return `${subjectId}::${faculty}`;
}

// ---------------------------------------------------------------------------
// Student academic details — department, program, year of study.
// ---------------------------------------------------------------------------

// All departments the college has; only CSE is actively used for now (and
// MCA, while its own program, is administered under CSE too). The Admin
// portal's Register/Edit forms default to CSE and offer the rest so new
// departments can be turned on later without a code change.
export const DEPARTMENTS = ["CSE", "ECE", "EEE", "CHEMICAL", "CIVIL", "MECHANICAL"];
export const DEFAULT_DEPARTMENT = "CSE";

// Which years of study exist for each program — drives both the Register
// form's "Year" dropdown and the "All Years" filter on Manage Students.
export const PROGRAM_YEARS = {
  "B.Tech": [1, 2, 3, 4],
  "M.Tech": [1, 2],
  MCA: [1, 2, 3],
};
export const PROGRAMS = Object.keys(PROGRAM_YEARS);

// Entry type only matters for B.Tech: "regular" students join in Year 1,
// "lateral" entry (diploma holders) join directly into Year 2. This drives
// both the roll-number ID's 1A/5A segment (generated server-side) and
// which years are selectable here.
export const ENTRY_TYPES = [
  { value: "regular", label: "Regular" },
  { value: "lateral", label: "Lateral Entry" },
];

export function yearsForEntry(program, entryType) {
  const years = PROGRAM_YEARS[program] || PROGRAM_YEARS[PROGRAMS[0]];
  if (program === "B.Tech" && entryType === "lateral") {
    return years.filter((y) => y >= 2);
  }
  return years;
}

// ---------------------------------------------------------------------------
// Faculty feedback form — 1–5 agreement scale
// ---------------------------------------------------------------------------

export const RATING_LABELS = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

// 8 categories + a short overall evaluation = 9 steps, 46 rating questions.
// Every portal (Student form, Faculty analytics, Admin reports) reads this
// one structure, so adding or renaming a category updates all of them.
export const FEEDBACK_CATEGORIES = [
  {
    key: "teaching",
    title: "Teaching & Subject Knowledge",
    purpose: "Evaluate how well the faculty teaches the subject.",
    questions: [
      "The faculty demonstrates strong knowledge of the subject.",
      "The faculty explains concepts clearly and effectively.",
      "The faculty explains difficult topics in an understandable manner.",
      "The faculty provides relevant examples to improve understanding.",
      "The faculty connects theoretical concepts with practical applications.",
      "The faculty encourages students to understand concepts rather than memorize them.",
    ],
  },
  {
    key: "methodology",
    title: "Teaching Methodology",
    purpose: "Evaluate the methods and techniques used during teaching.",
    questions: [
      "The faculty uses effective teaching methods.",
      "The pace of teaching is appropriate for the class.",
      "The faculty uses suitable teaching aids such as presentations, videos, demonstrations, etc.",
      "The faculty encourages students to actively participate in class.",
      "The faculty uses practical or real-world examples where appropriate.",
      "The faculty adapts their teaching approach when students have difficulty understanding a topic.",
    ],
  },
  {
    key: "punctuality",
    title: "Punctuality & Regularity",
    purpose: "Evaluate the faculty's discipline and time management.",
    questions: [
      "The faculty arrives for class on time.",
      "The faculty conducts classes regularly.",
      "The faculty makes effective use of the allotted class time.",
      "The faculty avoids unnecessary cancellation or postponement of classes.",
      "The faculty follows the planned academic schedule.",
    ],
  },
  {
    key: "communication",
    title: "Communication & Interaction",
    purpose: "Evaluate how effectively the faculty communicates and interacts with students.",
    questions: [
      "The faculty communicates clearly with students.",
      "The faculty listens patiently to students' questions and concerns.",
      "The faculty responds effectively to students' doubts.",
      "The faculty is approachable when students need academic assistance.",
      "The faculty encourages students to ask questions and express their opinions.",
    ],
  },
  {
    key: "classroom",
    title: "Classroom Management",
    purpose: "Evaluate the learning environment created by the faculty.",
    questions: [
      "The faculty maintains a positive learning environment.",
      "The faculty manages classroom discipline effectively.",
      "The faculty keeps students engaged during class.",
      "The faculty provides sufficient opportunities for students to participate.",
      "The faculty maintains a professional atmosphere in the classroom.",
    ],
  },
  {
    key: "assessment",
    title: "Assignments & Assessment",
    purpose: "Evaluate tests, assignments, evaluation and feedback.",
    questions: [
      "The assignments given are relevant to the subject.",
      "The faculty provides clear instructions for assignments and assessments.",
      "Assessments are conducted according to the planned schedule.",
      "The difficulty level of assessments is appropriate.",
      "The evaluation of assignments and examinations is fair and unbiased.",
      "The faculty provides useful feedback on students' performance.",
    ],
  },
  {
    key: "mentoring",
    title: "Student Support & Mentoring",
    purpose: "Evaluate how much the faculty supports students beyond regular teaching.",
    questions: [
      "The faculty provides guidance when students face academic difficulties.",
      "The faculty motivates students to improve their academic performance.",
      "The faculty encourages students to develop problem-solving and critical-thinking skills.",
      "The faculty provides useful guidance for projects, seminars, and other academic activities.",
      "The faculty supports students in achieving their academic goals.",
    ],
  },
  {
    key: "professionalism",
    title: "Professionalism & Fairness",
    purpose: "Evaluate how respectfully and fairly the faculty treats students.",
    questions: [
      "The faculty treats all students with respect.",
      "The faculty treats students fairly and without favoritism.",
      "The faculty maintains professional behavior with students.",
      "The faculty respects students' opinions and concerns.",
      "The faculty handles disagreements or conflicts professionally.",
    ],
  },
  {
    key: "overall",
    title: "Overall Faculty Evaluation",
    purpose: "A short summary of your overall opinion, then optional comments.",
    isFinal: true, // this step also shows the star rating + comment boxes
    questions: [
      "Overall, the faculty is effective in teaching the subject.",
      "The faculty has contributed positively to my learning.",
      "I am satisfied with the faculty's overall performance.",
    ],
  },
];

// Three optional text boxes on the final step (rating questions are
// mandatory; these are not).
export const COMMENT_FIELDS = [
  { key: "strengths", short: "Strengths", label: "What are the faculty's strengths?" },
  {
    key: "improvements",
    short: "To improve",
    label: "What areas of the faculty's teaching could be improved?",
  },
  { key: "suggestions", short: "Suggestions", label: "Any additional suggestions or comments?" },
];

export const TOTAL_RATING_QUESTIONS = FEEDBACK_CATEGORIES.reduce(
  (count, c) => count + c.questions.length,
  0
);

// ---------------------------------------------------------------------------
// Scoring helpers — shared by the Student, Faculty and Admin portals.
//
// A submission looks like:
// {
//   subjectId, subject, faculty, studentId, studentName,
//   answers: { teaching: [5,4,...], methodology: [...], ..., overall: [...] },
//   overallRating: 1-5,            // the star rating
//   strengths, improvements, suggestions,   // optional text
//   submittedAt
// }
// ---------------------------------------------------------------------------

export function average(numbers) {
  if (!numbers.length) return null;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

// Mean of all 46 rating answers in one submission.
export function submissionScore(submission) {
  return average(Object.values(submission.answers).flat());
}

// Mean score across a list of submissions.
export function scoreOf(list) {
  return average(list.map(submissionScore));
}

export function overallRatingAverage(list) {
  return average(list.map((s) => s.overallRating));
}

// Per-category average across a list of submissions, in form order.
export function categoryScores(list) {
  return FEEDBACK_CATEGORIES.map((category) => ({
    key: category.key,
    title: category.title,
    avg: average(list.flatMap((s) => s.answers[category.key] || [])),
  }));
}

export function formatScore(value) {
  return value === null || value === undefined ? "—" : value.toFixed(2);
}

// ---------------------------------------------------------------------------
// Seeded accounts. Every account starts with mustChangePassword: true,
// exactly matching the HOD's registration process — login once with the
// default password, then you're required to set your own. (Kept for
// reference/seed.js; real accounts live in MySQL, not here.)
// ---------------------------------------------------------------------------
export const SEED_USERS = [
  {
    id: "21A91A0501",
    name: "Vyshnavi",
    role: "student",
    password: defaultPasswordFor("Vyshnavi"),
    mustChangePassword: true,
  },
  {
    id: "FAC101",
    name: "Dr. Ramesh",
    role: "faculty",
    password: defaultPasswordFor("Dr. Ramesh"),
    mustChangePassword: true,
  },
  {
    id: "FAC102",
    name: "Dr. Priya Menon",
    role: "faculty",
    password: defaultPasswordFor("Dr. Priya Menon"),
    mustChangePassword: true,
  },
  {
    id: "FAC103",
    name: "Dr. Suresh Kumar",
    role: "faculty",
    password: defaultPasswordFor("Dr. Suresh Kumar"),
    mustChangePassword: true,
  },
  {
    id: "FAC104",
    name: "Dr. Anitha Rao",
    role: "faculty",
    password: defaultPasswordFor("Dr. Anitha Rao"),
    mustChangePassword: true,
  },
  {
    id: "HOD001",
    name: "HOD Admin",
    role: "admin",
    password: defaultPasswordFor("HOD Admin"),
    mustChangePassword: true,
  },
];