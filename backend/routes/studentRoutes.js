const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { body } = require("express-validator");

// Validation middleware
const validateStudentInput = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("codeforcesHandle")
    .notEmpty()
    .withMessage("Codeforces handle is required"),
];

// Get all students
router.get("/", studentController.getStudents);

// Export students as CSV
router.get("/export-csv", studentController.exportStudentsCSV);

// Get a specific student
router.get("/:id", studentController.getStudent);

// Create a new student
router.post("/", validateStudentInput, studentController.createStudent);

// Update a student
router.put("/:id", studentController.updateStudent);

// Delete a student
router.delete("/:id", studentController.deleteStudent);

// Reset reminder count
router.post("/:id/reset-reminder", studentController.resetReminderCount);

// Toggle reminder status
router.post("/:id/toggle-reminders", studentController.toggleReminders);

module.exports = router;
