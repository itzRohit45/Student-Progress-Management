import axios from "axios";

const API_URL = "/api/codeforces";

// Get a student's contest history
export const getContestHistory = async (studentId, timeRange) => {
  try {
    const params = timeRange ? { timeRange } : {};
    const response = await axios.get(
      `${API_URL}/student/${studentId}/contests`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching contest history for student ${studentId}:`,
      error
    );
    throw error;
  }
};

// Get a student's problem solving data
export const getProblemSolvingData = async (studentId, timeRange) => {
  try {
    const params = timeRange ? { timeRange } : {};
    const response = await axios.get(
      `${API_URL}/student/${studentId}/problems`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching problem solving data for student ${studentId}:`,
      error
    );
    throw error;
  }
};

// Manually refresh a student's Codeforces data
export const refreshStudentData = async (studentId) => {
  try {
    const response = await axios.post(
      `${API_URL}/student/${studentId}/refresh`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error refreshing Codeforces data for student ${studentId}:`,
      error
    );
    throw error;
  }
};
