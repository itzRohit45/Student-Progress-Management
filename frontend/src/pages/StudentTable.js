import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import { FaPlus, FaDownload, FaSearch } from "react-icons/fa";
import {
  getStudents,
  deleteStudent,
  toggleReminders,
} from "../services/studentService";
import { refreshStudentData } from "../services/codeforcesService";
import StudentsList from "../components/students/StudentsList";
import StudentForm from "../components/students/StudentForm";
import EditStudentForm from "../components/students/EditStudentForm";
import "./StudentTable.css";

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshingIds, setRefreshingIds] = useState([]);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch all students from API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new student
  const handleAddStudent = (newStudent) => {
    setStudents([...students, newStudent]);
    setShowAddForm(false);
  };

  // Handle editing a student
  const handleEditStudent = (student) => {
    setEditingStudent(student);
  };

  // Handle student update
  const handleStudentUpdated = (updatedStudent) => {
    setStudents(
      students.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
    );
    setEditingStudent(null);
  };

  // Handle deleting a student
  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        await deleteStudent(student._id);
        setStudents(students.filter((s) => s._id !== student._id));
        toast.success("Student deleted successfully");
      } catch (error) {
        toast.error("Failed to delete student");
      }
    }
  };

  // Handle refreshing student data
  const handleRefreshData = async (studentId) => {
    try {
      setRefreshingIds([...refreshingIds, studentId]);

      const response = await refreshStudentData(studentId);

      // Update the student in the list
      setStudents(
        students.map((s) => (s._id === studentId ? response.student : s))
      );

      toast.success("Codeforces data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh Codeforces data");
    } finally {
      setRefreshingIds(refreshingIds.filter((id) => id !== studentId));
    }
  };

  // Handle toggling reminders
  const handleToggleReminders = async (studentId) => {
    try {
      const updatedStudent = await toggleReminders(studentId);
      setStudents(
        students.map((s) => (s._id === studentId ? updatedStudent : s))
      );

      const message = updatedStudent.disableReminders
        ? "Reminders disabled for this student"
        : "Reminders enabled for this student";
      toast.success(message);
    } catch (error) {
      toast.error("Failed to toggle reminder status");
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.codeforcesHandle.toLowerCase().includes(searchLower) ||
      (student.phoneNumber && student.phoneNumber.includes(searchTerm))
    );
  });

  // Prepare CSV data for export
  const csvData = [
    [
      "Name",
      "Email",
      "Phone Number",
      "Codeforces Handle",
      "Current Rating",
      "Max Rating",
      "Last Updated",
      "Reminders Disabled",
      "Reminders Sent",
    ],
    ...students.map((s) => [
      s.name,
      s.email,
      s.phoneNumber || "",
      s.codeforcesHandle,
      s.currentRating || 0,
      s.maxRating || 0,
      s.lastDataUpdate,
      s.disableReminders ? "Yes" : "No",
      s.remindersSent || 0,
    ]),
  ];

  // Render content based on loading state
  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading students...</div>;
    }

    if (showAddForm) {
      return (
        <StudentForm
          onStudentAdded={handleAddStudent}
          onCancel={() => setShowAddForm(false)}
        />
      );
    }

    if (editingStudent) {
      return (
        <EditStudentForm
          student={editingStudent}
          onStudentUpdated={handleStudentUpdated}
          onCancel={() => setEditingStudent(null)}
        />
      );
    }

    return (
      <>
        <div className="students-header">
          <h1>Students</h1>

          <div className="action-buttons">
            <CSVLink
              data={csvData}
              filename="students.csv"
              className="button button-secondary"
              target="_blank"
            >
              <FaDownload /> Export CSV
            </CSVLink>

            <button
              className="button button-primary"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus /> Add Student
            </button>
          </div>
        </div>

        <div className="search-bar">
          <span className="search-icon">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or Codeforces handle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <StudentsList
          students={filteredStudents}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onRefresh={handleRefreshData}
          onToggleReminders={handleToggleReminders}
          refreshingIds={refreshingIds}
        />

        {filteredStudents.length === 0 && searchTerm && (
          <div className="no-results">
            <p>No students found matching "{searchTerm}"</p>
          </div>
        )}
      </>
    );
  };

  return <div className="student-table-container">{renderContent()}</div>;
};

export default StudentTable;
