# FacultyPulse — Full Stack Development-II Mini Project

A feedback platform with three portals (Student, Faculty, Admin/HOD), a
real Express API, and a real MySQL database — nothing is mock data or
in-memory state anymore.

## 1. Set up the database (MySQL Workbench or CLI)

1. Open MySQL Workbench, connect to your local server.
2. Open `server/schema.sql` and run it (⚡ Execute). This creates the
   `facultypulse` database, its tables, and the subject/faculty data.
3. You will **not** see any rows in the `users` table yet — passwords need
   to be hashed by Node, which SQL can't do. That's what the seed script
   below is for.

## 2. Set up and seed the backend

```bash
cd server
npm install
cp .env.example .env
# edit .env with your MySQL username/password
npm run seed     # creates the starting accounts with hashed passwords
npm run dev      # starts the API on http://localhost:5000
```

The seed script prints each account's default password to the terminal —
that's the same list as the table below.

## 3. Run the frontend

```bash
cd frontend
npm install
cp .env.example .env   # only needed if your API isn't on localhost:5000
npm run dev
```

## Logging in

There's no portal picker — you log in with an ID and password, and your
role decides which portal you land in. Every account is registered by the
HOD (Admin portal → Register tab) with a default password equal to their
name, lowercase, no spaces (e.g. "Vyshnavi" → `vyshnavi`). First login
always forces a password change. You can also change your password any
time afterward from each portal's **Settings** tab.

**Demo logins (all require a password change on first login):**

| Role | ID | Default password |
|---|---|---|
| Student | `21A91A0501` | `vyshnavi` |
| Faculty | `FAC101` | `dr.ramesh` |
| Admin/HOD | `HOD001` | `hodadmin` |

**Why the HOD account isn't self-registered:** it's pre-provisioned by
`seed.js`, the same way a college's IT admin sets up the first root
account when a system is installed — the HOD has to already have a login
before they can register anyone else's. From the Admin portal, the HOD can
also register a second Admin/HOD account, for handover to a successor.

## Giving feedback (Student portal)

A student browses **subjects** first, not faculty. Several subjects have
two faculty teaching them (Full Stack Development, Python) — picking a
subject shows only the faculty who teach it, and the student chooses which
one to review before rating and commenting. The database enforces one
submission per student per subject (`UNIQUE KEY` in `schema.sql`), and the
API double-checks it too, so you get a clean error message either way.

## The three portals are actually connected

All feedback lives in the MySQL `feedback` table. A student's submission
immediately shows up in that faculty's analytics (average rating, rating
distribution, comments) and in the Admin portal's department-wide report
and response-rate calculation.

**Demo sequence to see this live:** log in as the student, submit feedback
for a couple of subjects → log out, log in as `FAC101` (Dr. Ramesh) → see
real analytics fill in → log out, log in as `HOD001` → see the department
report reflect it too.

## Institution/Faculty Directory — what it is

On the Student dashboard, "Faculty Directory" fetches the real faculty
list from the database (`GET /api/users`, filtered to `role: faculty`) and
cross-references it against subjects to show what each person teaches.
It's read-only — it exists to demonstrate the `useEffect`+fetch syllabus
requirement with real data, but selecting who to give feedback to always
goes through the Subject → Faculty picker on the Give Feedback tab, not
this list.

## Concept-to-file mapping

### 1. Modern JavaScript & DOM
Covered by the original `dashboard.js` / `student_dashboard.html` files
from the first project phase (DOM selectors, event listeners, function
types) — kept as-is; not part of the React app below.

### 2. Basics of React.js
| # | Concept | Where |
|---|---|---|
| a | Class component | `components/FacultyInfoCard.jsx` |
| b | Functional component | `components/FeedbackSummaryCard.jsx`, `StudentPortal.jsx` |
| c | Button click events | `handleSubmit`, subject/faculty picker buttons in `StudentPortal.jsx` |
| d | Conditional rendering | Empty vs. filled state in `FeedbackSummaryCard.jsx`; loading/error states in every portal; wizard steps in `StudentPortal.jsx` |
| e | String literals | `summaryHeading`, UI copy throughout |

### 3. Important concepts of React.js
| # | Concept | Where |
|---|---|---|
| a | `useState` hook | `components/StarRating.jsx`, wizard/tab state in every portal |
| b | `useEffect` + API fetch | `StudentPortal.jsx`, `FacultyPortal.jsx`, `AdminPortal.jsx`, `FacultyDirectory.jsx` — all fetch from the real Express API |
| c | Props shared between components | `subjects` passed to `FacultyDirectory.jsx`; `user` passed to `PasswordSettingsPanel.jsx`; `history`/`navItems` passed down throughout |
| d | Forms | `Login.jsx`, `ChangePassword.jsx`, `PasswordSettingsPanel.jsx`, the feedback form and Register form |
| e | Iterative rendering with `.map()` | `Sidebar.jsx` (nav items), subject/faculty pickers, `FacultyDirectory.jsx`, `FeedbackHistory.jsx`, bar charts, data tables |

### 4. Node.js & Express.js
| # | Concept | Where |
|---|---|---|
| a | Hello world route | `GET /` in `server/server.js` |
| b | Multiple routes on a small site | `/health`, `/api/auth`, `/api/users`, `/api/subjects`, `/api/feedback` |
| c | Print hello world to console | `console.log(...)` in `server.js` |
| d | CRUD operations | `routes/feedbackRoutes.js` (create/read), `routes/userRoutes.js` (create/read) |
| e | Connect API to database | `db.js` (mysql2 pool), used by every route file |

### 5. MySQL
| # | Concept | Where |
|---|---|---|
| a | Create database + tables | `schema.sql` |
| b | Insert/update via CLI or Workbench | `schema.sql` (subjects), `seed.js` (users, via Node/bcrypt) |
| c | Subqueries | `reports.sql` — run these in Workbench once you have real feedback data |
| d | Script file | `schema.sql` and `reports.sql` themselves |
| e | Initialize DB and wire into API | `schema.sql` → `seed.js` → `db.js` → route files |

## Known limitations, worth mentioning if your teacher asks

- Passwords are hashed with bcrypt — real practice, not just a demo
  shortcut — but there's no session/token auth (JWT, cookies) after login;
  the frontend just holds the logged-in user in React state for the
  session. Fine for a mini-project demo, not production-grade auth.
- The Register tab's "just created" credentials list only lives in that
  browser tab's memory — refreshing the Admin portal clears it (the
  accounts themselves are safely in MySQL either way).
