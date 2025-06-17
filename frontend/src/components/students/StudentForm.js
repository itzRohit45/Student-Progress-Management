import React, { useState } from "react";
import { toast } from "react-toastify";
import { createStudent } from "../../services/studentService";
import "./StudentForm.css";

const StudentForm = ({ onStudentAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    codeforcesHandle: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Please provide a valid email address";
    }

    if (!formData.codeforcesHandle.trim()) {
      newErrors.codeforcesHandle = "Codeforces handle is required";
    }

    // Add helper text for Codeforces handle
    if (formData.codeforcesHandle.includes("codeforces.com")) {
      formData.codeforcesHandle = formData.codeforcesHandle.trim();
      const handleMatch = formData.codeforcesHandle.match(
        /codeforces\.com\/profile\/([^\/\s]+)/i
      );
      if (handleMatch) {
        // Auto-extract the handle from URL, but no error needed
        formData.codeforcesHandle = handleMatch[1];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newStudent = await createStudent(formData);
      toast.success("Student added successfully");
      onStudentAdded(newStudent);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        codeforcesHandle: "",
      });
    } catch (error) {
      // Handle specific error messages from API
      const errorMessage =
        error.response?.data?.message || "Failed to add student";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="student-form-container">
      <h2>Add New Student</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="Enter student name"
            disabled={isSubmitting}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="Enter email address"
            disabled={isSubmitting}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter phone number (optional)"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="codeforcesHandle">Codeforces Handle *</label>
          <input
            type="text"
            id="codeforcesHandle"
            name="codeforcesHandle"
            value={formData.codeforcesHandle}
            onChange={handleChange}
            className={`form-control ${
              errors.codeforcesHandle ? "is-invalid" : ""
            }`}
            placeholder="Enter Codeforces handle"
            disabled={isSubmitting}
          />
          {errors.codeforcesHandle && (
            <div className="error-message">{errors.codeforcesHandle}</div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
