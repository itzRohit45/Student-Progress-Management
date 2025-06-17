import axios from "axios";

const API_URL = "/api/students";

// Get all students
export const getStudents = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// Get a single student by ID
export const getStudentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
};

// Create a new student
export const createStudent = async (studentData) => {
  try {
    const response = await axios.post(API_URL, studentData);
    return response.data;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};

// Update a student
export const updateStudent = async (id, studentData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
};

// Delete a student
export const deleteStudent = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting student ${id}:`, error);
    throw error;
  }
};

// Export students as CSV
export const exportStudentsAsCSV = async () => {
  try {
    const response = await axios.get(`${API_URL}/export-csv`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting students as CSV:", error);
    throw error;
  }
};

// Reset reminder count for a student
export const resetReminderCount = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/reset-reminder`);
    return response.data;
  } catch (error) {
    console.error(`Error resetting reminder count for student ${id}:`, error);
    throw error;
  }
};

// Toggle reminder status for a student
export const toggleReminders = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/toggle-reminders`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling reminders for student ${id}:`, error);
    throw error;
  }
};
