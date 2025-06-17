const express = require("express");
const router = express.Router();
const codeforcesController = require("../controllers/codeforcesController");

// Get student's contest history
router.get(
  "/student/:id/contests",
  codeforcesController.getStudentContestHistory
);

// Get student's problem solving data
router.get("/student/:id/problems", codeforcesController.getProblemSolvingData);

// Manually refresh a student's Codeforces data
router.post("/student/:id/refresh", codeforcesController.refreshStudentData);

module.exports = router;
