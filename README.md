# FacultyPulse — Full Stack Development-II Mini Project

A single, cohesive feedback platform (React frontend + Express/MySQL backend)
that naturally covers all required concepts, instead of separate toy demos.

The frontend has three portals — Student, Faculty, and Admin/HOD — styled to
match the purple/indigo dashboard design, sharing the same `Sidebar` and
`StatCard` components so the product feels like one system, not three.

**Logging in:** there's no portal picker anymore — you log in with an ID and
password, and your role decides which portal you land in. Every account is
registered by the HOD (Admin portal → Register tab) with a default password
equal to their name, lowercase, no spaces (e.g. "Vyshnavi" → `vyshnavi`).
First login always forces a password change before continuing.

**Demo logins (all require a password change on first login):**

| Role | ID | Default password |
|---|---|---|
| Student | `21A91A0501` | `vyshnavi` |
| Faculty | `FAC101` | `dr.ramesh` |
| Admin/HOD | `HOD001` | `hodadmin` |

**Giving feedback (Student portal):** a student browses subjects first, not
faculty. Several subjects have two faculty teaching them — picking a
subject shows only the faculty who teach it, and the student chooses which
one to review before rating and commenting.

**The three portals are connected.** All feedback lives in one shared
`submissions` array (owned by `App.jsx`). A student's submission
immediately shows up in that faculty's analytics (average rating, rating
distribution, comments) and in the Admin portal's department-wide report
and response-rate calculation — nothing is mock data anymore except the
one-time historical "sessions" list, which is clearly separate from the
live current-session numbers.

**Known limitation, worth mentioning to your teacher if asked:** state
lives in memory only — refreshing the page clears it, since there's no
backend wired in yet (that's what `/server` is for, see below). For a demo,
submit a couple of feedback entries as the student, then log out and log
in as that faculty member and the HOD to show the numbers update live.

## How to run

**Frontend**
```
cd frontend
npm install
npm run dev
```

**Backend**
```
cd server
npm install
mysql -u root -p < schema.sql   # creates the facultypulse database
# edit db.js with your MySQL password
npm run dev
```

## Concept-to-file mapping

### 1. Modern JavaScript & DOM
| # | Concept | Where |
|---|---|---|
| a | Link external JS file | `dashboard.js` linked in the original `student_dashboard.html` |
| b | DOM selectors | `getElementById`, `querySelector`, `querySelectorAll` in `dashboard.js` |
| c | Event listeners | `addEventListener` on submit button, `dashboard.js` |
| d | Button click handling | `viewStatus()`, `resetForm()`, `dashboard.js` |
| e | Function types (declaration/expression/arrow) | `feedbackSummary`, `thankYouMessage`, `dashboard.js` |

### 2. Basics of React.js
| # | Concept | Where |
|---|---|---|
| a | Class component | `components/FacultyInfoCard.jsx` |
| b | Functional component | `components/FeedbackSummaryCard.jsx`, `StudentPortal.jsx` |
| c | Button click events | `handleSubmit`, `resetForm` in `StudentPortal.jsx` |
| d | Conditional rendering | Empty vs. filled state in `FeedbackSummaryCard.jsx`; form vs. "already submitted" text and the three portal tabs in `StudentPortal.jsx` |
| e | String literals | `welcomeText`, `footerText`, `summaryHeading` etc. |

### 3. Important concepts of React.js
| # | Concept | Where |
|---|---|---|
| a | `useState` hook | `components/StarRating.jsx`, the `tab`/`step` state in every portal, `App.jsx`'s auth state |
| b | `useEffect` + API fetch | `components/FacultyDirectory.jsx` |
| c | Props shared between components | `users` lifted in `App.jsx` and passed to `Login.jsx`/`AdminPortal.jsx`; `history` passed to `FeedbackHistory.jsx` |
| d | Forms | `Login.jsx`, `ChangePassword.jsx`, the feedback form and Register form in `StudentPortal.jsx`/`AdminPortal.jsx` |
| e | Iterative rendering with `.map()` | `Sidebar.jsx` (nav items), subject/faculty pickers in `StudentPortal.jsx`, `FacultyDirectory.jsx`, `FeedbackHistory.jsx`, `FacultyPortal.jsx` (bar chart + comments), `AdminPortal.jsx` (tables) |

### Portal structure (visual layer, matches the provided mockup)
| Portal | File | Screens |
|---|---|---|
| Student | `components/StudentPortal.jsx` | Dashboard, Give Feedback, My Feedback |
| Faculty | `components/FacultyPortal.jsx` | Dashboard/Analytics, Comments, Reports |
| Admin/HOD | `components/AdminPortal.jsx` | Dashboard, Manage Faculty, Feedback Sessions |

Shared UI: `Sidebar.jsx` (navigation shell) and `StatCard.jsx` (stat tiles),
themed via `theme.css` (color/design tokens) and `portal.css` (layout).

### 4. Node.js & Express.js
| # | Concept | Where |
|---|---|---|
| a | Hello world route | `GET /` in `server/server.js` |
| b | Multiple routes on a small site | `GET /about`, `GET /health`, `/api/feedback` in `server.js` |
| c | Print hello world to console | `console.log(...)` in `server.js` |
| d | CRUD operations | `server/routes/feedbackRoutes.js` |
| e | Connect API to database | `server/db.js` (mysql2 pool used by `feedbackRoutes.js`) |

### 5. MySQL
| # | Concept | Where |
|---|---|---|
| a | Create database + table | `schema.sql`, section (5a) |
| b | Insert/update via CLI | `schema.sql`, section (5b) |
| c | Subqueries | `schema.sql`, section (5c) — faculty with above-average rating |
| d | Script file | `schema.sql` itself |
| e | Initialize DB and wire into API | `schema.sql`, section (5e) + `server/db.js` |

## Notes for the demo/presentation

- `FacultyDirectory.jsx` currently fetches from a public placeholder API
  (`jsonplaceholder.typicode.com`) so the useEffect/fetch concept works
  out of the box with zero setup. Once the Express server is running, you
  can point it at `http://localhost:5000/api/feedback` instead to show the
  full stack connected end to end.
- All five basics (section 2) and all five "important concepts" (section 3)
  live inside one running app — nothing is a standalone throwaway demo.
