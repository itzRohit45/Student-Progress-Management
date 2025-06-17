import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSync } from "react-icons/fa";
import { getStudentById } from "../services/studentService";
import {
  getContestHistory,
  getProblemSolvingData,
  refreshStudentData,
} from "../services/codeforcesService";
import ContestHistory from "../components/codeforces/ContestHistory";
import ProblemSolvingData from "../components/codeforces/ProblemSolvingData";
import {
  getRatingColor,
  getRatingLevel,
  formatDate,
} from "../utils/formatters";
import "./StudentProfile.css";

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [contests, setContests] = useState([]);
  const [problemData, setProblemData] = useState({});
  const [activeSection, setActiveSection] = useState("contests");
  const [contestTimeRange, setContestTimeRange] = useState("365");
  const [problemTimeRange, setProblemTimeRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch student data on component mount
  useEffect(() => {
    fetchStudentData();
  }, [id]);

  // Fetch contest data when active section or time range changes
  useEffect(() => {
    if (student && activeSection === "contests") {
      fetchContestData(contestTimeRange);
    }
  }, [student, activeSection, contestTimeRange]);

  // Fetch problem data when active section or time range changes
  useEffect(() => {
    if (student && activeSection === "problems") {
      fetchProblemData(problemTimeRange);
    }
  }, [student, activeSection, problemTimeRange]);

  // Fetch student basic data
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const data = await getStudentById(id);
      setStudent(data);

      // Fetch initial contest data
      await fetchContestData(contestTimeRange);

      setLoading(false);
    } catch (error) {
      toast.error("Failed to load student data");
      setLoading(false);
    }
  };

  // Fetch contest history
  const fetchContestData = async (timeRange) => {
    if (!student) return;

    try {
      const data = await getContestHistory(id, timeRange);
      setContests(data.contests || []);
    } catch (error) {
      console.error("Error fetching contest data:", error);
      toast.error("Failed to load contest data");
    }
  };

  // Fetch problem solving data
  const fetchProblemData = async (timeRange) => {
    if (!student) return;

    try {
      const data = await getProblemSolvingData(id, timeRange);
      setProblemData(data);
    } catch (error) {
      console.error("Error fetching problem data:", error);
      toast.error("Failed to load problem solving data");
    }
  };

  // Handle section change
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Handle refreshing student data
  const handleRefreshData = async () => {
    try {
      setRefreshing(true);

      const response = await refreshStudentData(id);
      setStudent(response.student);

      // Refresh the current section data
      if (activeSection === "contests") {
        await fetchContestData(contestTimeRange);
      } else {
        await fetchProblemData(problemTimeRange);
      }

      toast.success("Codeforces data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh Codeforces data");
    } finally {
      setRefreshing(false);
    }
  };

  // Render content based on loading state
  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading student data...</div>;
    }

    if (!student) {
      return <div className="error-message">Student not found</div>;
    }

    return (
      <>
        <div className="profile-header">
          <div className="back-button-container">
            <Link to="/students" className="back-button">
              <FaArrowLeft /> Back to Students
            </Link>
          </div>

          <div className="profile-header-content">
            <div className="profile-info">
              <h1 className="profile-name">{student.name}</h1>

              <div className="profile-meta">
                <div className="profile-meta-item">
                  <span className="label">Email:</span>
                  <span className="value">{student.email}</span>
                </div>

                {student.phoneNumber && (
                  <div className="profile-meta-item">
                    <span className="label">Phone:</span>
                    <span className="value">{student.phoneNumber}</span>
                  </div>
                )}

                <div className="profile-meta-item">
                  <span className="label">Codeforces:</span>
                  <a
                    href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="value cf-handle"
                    style={{ color: getRatingColor(student.currentRating) }}
                  >
                    {student.codeforcesHandle}
                  </a>
                </div>

                <div className="profile-meta-item">
                  <span className="label">Rating:</span>
                  <span
                    className="value rating"
                    style={{ color: getRatingColor(student.currentRating) }}
                  >
                    {student.currentRating} (
                    {getRatingLevel(student.currentRating)})
                  </span>
                </div>

                <div className="profile-meta-item">
                  <span className="label">Max Rating:</span>
                  <span
                    className="value rating"
                    style={{ color: getRatingColor(student.maxRating) }}
                  >
                    {student.maxRating} ({getRatingLevel(student.maxRating)})
                  </span>
                </div>

                <div className="profile-meta-item">
                  <span className="label">Last Updated:</span>
                  <span className="value">
                    {formatDate(student.lastDataUpdate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button
                className="button button-secondary"
                onClick={handleRefreshData}
                disabled={refreshing}
              >
                <FaSync className={refreshing ? "icon-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${
              activeSection === "contests" ? "active" : ""
            }`}
            onClick={() => handleSectionChange("contests")}
          >
            Contest History
          </button>
          <button
            className={`tab-button ${
              activeSection === "problems" ? "active" : ""
            }`}
            onClick={() => handleSectionChange("problems")}
          >
            Problem Solving Data
          </button>
        </div>

        <div className="profile-content">
          {activeSection === "contests" ? (
            <ContestHistory
              contests={contests}
              handle={student.codeforcesHandle}
              timeRange={contestTimeRange}
              onTimeRangeChange={setContestTimeRange}
            />
          ) : (
            <ProblemSolvingData
              data={problemData}
              handle={student.codeforcesHandle}
              timeRange={problemTimeRange}
              onTimeRangeChange={setProblemTimeRange}
            />
          )}
        </div>
      </>
    );
  };

  return <div className="student-profile-container">{renderContent()}</div>;
};

export default StudentProfile;
