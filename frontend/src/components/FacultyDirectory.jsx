import { useState, useEffect } from "react";
import { Users } from "lucide-react";

// (3b) React program to fetch data from an API using the useEffect hook.
// Runs once on mount (empty dependency array) to load a directory.
// This is deliberately read-only/informational — selecting who to give
// feedback to happens through the Subject -> Faculty picker in
// StudentPortal instead, so this list never drives the feedback form.
// (3e) Iterative rendering using map() to turn the response into list items.
function FacultyDirectory() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users?_limit=5")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch directory data");
        return res.json();
      })
      .then((data) => {
        setFacultyList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="directory-status">Loading directory...</p>;
  }

  if (error) {
    return <p className="directory-status directory-error">{error}</p>;
  }

  return (
    <div className="faculty-directory">
      <h3>
        <Users size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
        Institution Directory
      </h3>
      <ul>
        {facultyList.map((person) => (
          <li key={person.id}>
            {person.name} <span className="dept">· {person.company?.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FacultyDirectory;
