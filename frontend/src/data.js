// Default password rule set by the HOD when registering someone:
// the user's name, lowercased, with spaces removed. Used both to seed the
// initial accounts below and to generate credentials for anyone the HOD
// registers later from the Admin portal's Register tab.
export function defaultPasswordFor(name) {
  return name.toLowerCase().replace(/\s+/g, "");
}

// Subjects, each taught by two or more faculty — a student picks the
// subject first, then picks which of that subject's faculty to review.
export const SUBJECTS = [
  { id: "fsd", name: "Full Stack Development", faculty: ["Dr. Ramesh", "Dr. Anitha Rao"] },
  { id: "java", name: "Java Programming", faculty: ["Dr. Priya Menon", "Dr. Suresh Kumar"] },
  { id: "python", name: "Python Programming", faculty: ["Dr. Ramesh", "Dr. Priya Menon"] },
  { id: "dbms", name: "Database Management Systems", faculty: ["Dr. Suresh Kumar", "Dr. Anitha Rao"] },
];

// Seeded accounts. Every account starts with mustChangePassword: true,
// exactly matching the HOD's registration process — login once with the
// default password, then you're required to set your own.
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