import { Component } from "react";

// (2a) React Class Component — Faculty profile card, using lifecycle methods
// (componentDidMount / componentDidUpdate) to demonstrate class-based state.
class FacultyInfoCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastUpdated: new Date().toLocaleTimeString(),
    };
  }

  componentDidMount() {
    console.log(`FacultyInfoCard mounted - profile loaded for ${this.props.faculty}`);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.faculty !== this.props.faculty ||
      prevProps.subject !== this.props.subject
    ) {
      this.setState({ lastUpdated: new Date().toLocaleTimeString() });
    }
  }

  render() {
    const { faculty, subject, status } = this.props;

    return (
      <div className="faculty-info-card">
        <h3>Faculty Profile</h3>
        <p>
          <strong>Name:</strong> {faculty}
        </p>
        <p>
          <strong>Subject:</strong> {subject}
        </p>
        <p>
          <strong>Feedback Status:</strong>{" "}
          {status === "Pending" ? (
            <span className="badge badge-pending">Pending</span>
          ) : (
            <span className="badge badge-submitted">Submitted</span>
          )}
        </p>
        <p className="last-updated">Last updated: {this.state.lastUpdated}</p>
      </div>
    );
  }
}

export default FacultyInfoCard;
