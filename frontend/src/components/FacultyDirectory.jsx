import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { api } from "../api";

// (3b) React program to fetch data from an API using the useEffect hook.
// This used to pull random names from a public placeholder API — now it
// fetches your actual faculty from the database and cross-references
// `subjects` (already fetched by StudentPortal, passed down as a prop) to
// show what each one teaches. Read-only: selecting who to give feedback to
// still happens through the Subject -> Faculty picker, not here.
// (3e) Iterative rendering using map() over both the faculty list and each
// faculty's subject list.
   function FacultyDirectory({ subjects = [] }) {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .fetchUsers()
      .then((users) => {
        setFacultyList(users.filter((u) => u.role === "faculty"));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function subjectsTaughtBy(name) {
    return subjects.filter((s) => s.faculty.includes(name)).map((s) => s.name);
  }

  if (loading) {
    return <p className="directory-status">Loading faculty directory...</p>;
  }

  if (error) {
    return <p className="directory-status directory-error">{error}</p>;
  }

  return (
    <div className="faculty-directory">
      <h3>
        <Users size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
        Faculty Directory
      </h3>
      <ul>
        {facultyList.map((person) => (
          <li key={person.id}>
            {person.name}{" "}
            <span className="dept">· {subjectsTaughtBy(person.name).join(", ") || "No subjects assigned"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FacultyDirectory;
