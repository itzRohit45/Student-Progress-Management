import axios from "axios";

const API_URL = "/api/config";

// Get all configurations
export const getAllConfigs = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching configurations:", error);
    throw error;
  }
};

// Get a specific configuration
export const getConfig = async (name) => {
  try {
    const response = await axios.get(`${API_URL}/${name}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching configuration ${name}:`, error);
    throw error;
  }
};

// Update a configuration
export const updateConfig = async (name, value, description) => {
  try {
    const response = await axios.put(`${API_URL}/${name}`, {
      value,
      description,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating configuration ${name}:`, error);
    throw error;
  }
};
