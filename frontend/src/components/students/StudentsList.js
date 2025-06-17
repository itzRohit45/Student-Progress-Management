import React from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaSync, FaBell, FaBellSlash } from "react-icons/fa";
import { formatDate, timeAgo, getRatingColor } from "../../utils/formatters";
import "./StudentsList.css";

const StudentsList = ({
  students,
  onEdit,
  onDelete,
  onRefresh,
  onToggleReminders,
}) => {
  // If no students, display a message
  if (students.length === 0) {
    return (
      <div className="no-students-container">
        <p>No students found. Add a student to get started.</p>
      </div>
    );
  }

  return (
    <div className="students-list-container">
      <div className="table-responsive">
        <table className="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>CF Handle</th>
              <th>Current Rating</th>
              <th>Max Rating</th>
              <th>Last Updated</th>
              <th>Reminders</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>
                  <Link
                    to={`/students/${student._id}`}
                    className="student-name"
                  >
                    {student.name}
                  </Link>
                </td>
                <td>{student.email}</td>
                <td>{student.phoneNumber || "-"}</td>
                <td>
                  <a
                    href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="codeforces-handle"
                    style={{ color: getRatingColor(student.currentRating) }}
                  >
                    {student.codeforcesHandle}
                  </a>
                </td>
                <td>
                  <span
                    className="rating"
                    style={{ color: getRatingColor(student.currentRating) }}
                  >
                    {student.currentRating || "-"}
                  </span>
                </td>
                <td>
                  <span
                    className="rating"
                    style={{ color: getRatingColor(student.maxRating) }}
                  >
                    {student.maxRating || "-"}
                  </span>
                </td>
                <td title={formatDate(student.lastDataUpdate)}>
                  {timeAgo(student.lastDataUpdate)}
                </td>
                <td>
                  <div
                    className="reminder-info"
                    title={
                      student.lastReminderDate
                        ? `Last reminder: ${formatDate(
                            student.lastReminderDate
                          )}`
                        : "No reminders sent"
                    }
                  >
                    <span
                      className={`reminder-count ${
                        student.disableReminders ? "disabled" : ""
                      }`}
                    >
                      {student.remindersSent || "0"} sent
                      {student.disableReminders ? " (disabled)" : ""}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(student)}
                      title="Edit student"
                    >
                      <FaEdit />
                    </button>

                    <button
                      className="action-btn refresh-btn"
                      onClick={() => onRefresh(student._id)}
                      title="Refresh Codeforces data"
                    >
                      <FaSync />
                    </button>

                    <button
                      className={`action-btn reminder-btn ${
                        student.disableReminders ? "disabled" : ""
                      }`}
                      onClick={() => onToggleReminders(student._id)}
                      title={
                        student.disableReminders
                          ? "Enable reminders"
                          : "Disable reminders"
                      }
                    >
                      {student.disableReminders ? <FaBellSlash /> : <FaBell />}
                    </button>

                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDelete(student)}
                      title="Delete student"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsList;
