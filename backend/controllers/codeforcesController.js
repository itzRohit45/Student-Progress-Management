const StudentCodeforces = require("../models/StudentCodeforces");
const Student = require("../models/Student");
const codeforcesService = require("../services/codeforcesService");

// Get student's Codeforces contest history
exports.getStudentContestHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeRange } = req.query; // 30, 90, 365 days

    // Verify student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get Codeforces data
    const codeforcesData = await StudentCodeforces.findOne({ studentId: id });
    if (!codeforcesData) {
      return res
        .status(404)
        .json({ message: "No Codeforces data found for this student" });
    }

    // Filter contests by time range
    let contests = codeforcesData.contests || [];

    if (timeRange) {
      const days = parseInt(timeRange);
      if (!isNaN(days)) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        contests = contests.filter(
          (contest) => new Date(contest.date) >= cutoffDate
        );
      }
    }

    // Sort contests by date (newest first)
    contests.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      handle: codeforcesData.handle,
      contests,
    });
  } catch (error) {
    console.error("Error fetching contest history:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch contest history",
        error: error.message,
      });
  }
};

// Get student's problem solving data
exports.getProblemSolvingData = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeRange } = req.query; // 7, 30, 90 days

    // Verify student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get Codeforces data
    const codeforcesData = await StudentCodeforces.findOne({ studentId: id });
    if (!codeforcesData) {
      return res
        .status(404)
        .json({ message: "No Codeforces data found for this student" });
    }

    // Filter submissions by time range
    let submissions = codeforcesData.submissions || [];

    // Default to all if timeRange is not specified
    let days = timeRange ? parseInt(timeRange) : null;
    let cutoffDate = null;

    if (days && !isNaN(days)) {
      cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      submissions = submissions.filter(
        (sub) =>
          new Date(sub.submissionDate) >= cutoffDate && sub.verdict === "OK" // Only count accepted submissions
      );
    } else {
      submissions = submissions.filter((sub) => sub.verdict === "OK");
    }

    // Calculate stats
    const totalSolved = new Set(
      submissions.map((s) => `${s.contestId}-${s.problemIndex}`)
    ).size;

    let mostDifficultProblem = {
      rating: 0,
      name: "None",
      problemIndex: "",
      contestId: 0,
    };
    let solvedByRating = {};
    let totalRating = 0;
    let ratedProblemsCount = 0;

    // Process submissions
    submissions.forEach((sub) => {
      if (sub.problemRating) {
        // For most difficult problem
        if (sub.problemRating > mostDifficultProblem.rating) {
          mostDifficultProblem = {
            rating: sub.problemRating,
            name: sub.problemName,
            problemIndex: sub.problemIndex,
            contestId: sub.contestId,
          };
        }

        // For rating distribution
        const rating = sub.problemRating;
        const ratingBucket = Math.floor(rating / 100) * 100;
        solvedByRating[ratingBucket] = (solvedByRating[ratingBucket] || 0) + 1;

        // For average rating
        totalRating += rating;
        ratedProblemsCount++;
      }
    });

    // Create submission heatmap data
    // Group by date and count submissions
    const heatmapData = {};
    submissions.forEach((sub) => {
      const date = new Date(sub.submissionDate).toISOString().split("T")[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    // Calculate average problems per day
    const uniqueDates = Object.keys(heatmapData).length;
    const averageProblemsPerDay =
      uniqueDates > 0 ? totalSolved / uniqueDates : 0;

    // Calculate average rating
    const averageRating =
      ratedProblemsCount > 0 ? totalRating / ratedProblemsCount : 0;

    const result = {
      handle: codeforcesData.handle,
      timeRange: days,
      mostDifficultProblem,
      totalSolved,
      averageRating: Math.round(averageRating),
      averageProblemsPerDay: averageProblemsPerDay.toFixed(2),
      solvedByRating,
      heatmapData,
      lastSubmissionDate: codeforcesData.lastSubmissionDate,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching problem solving data:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch problem solving data",
        error: error.message,
      });
  }
};

// Manually refresh a student's Codeforces data
exports.refreshStudentData = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Fetch and save new data
    await codeforcesService.fetchAndSaveUserData(id, student.codeforcesHandle);

    // Update student ratings
    const cfData = await StudentCodeforces.findOne({ studentId: id });
    if (cfData && cfData.contests && cfData.contests.length > 0) {
      // Sort contests by date (newest first)
      const sortedContests = [...cfData.contests].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // Get current rating from the most recent contest
      const currentRating = sortedContests[0].newRating || 0;

      // Calculate max rating
      const maxRating = cfData.contests.reduce(
        (max, contest) => Math.max(max, contest.newRating || 0),
        0
      );

      // Update student
      await Student.findByIdAndUpdate(id, {
        currentRating,
        maxRating,
        lastDataUpdate: new Date(),
      });
    }

    const updatedStudent = await Student.findById(id);
    res.status(200).json({
      message: "Codeforces data refreshed successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error refreshing Codeforces data:", error);
    res
      .status(500)
      .json({
        message: "Failed to refresh Codeforces data",
        error: error.message,
      });
  }
};
