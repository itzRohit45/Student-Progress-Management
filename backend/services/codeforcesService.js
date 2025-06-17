const axios = require("axios");
const StudentCodeforces = require("../models/StudentCodeforces");
const Student = require("../models/Student");

// Base URL for Codeforces API
const CF_API_BASE = "https://codeforces.com/api";

// Helper function to add delay between API calls to respect rate limits
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch and save user's Codeforces data
exports.fetchAndSaveUserData = async (studentId, handle) => {
  try {
    // First, check if the user exists on Codeforces
    const userExists = await this.checkUserExists(handle);
    if (!userExists) {
      throw new Error(`Codeforces user ${handle} not found`);
    }

    // Fetch all required data in parallel
    const [userInfo, userRating, userStatus] = await Promise.all([
      this.fetchUserInfo(handle),
      this.fetchUserRating(handle),
      this.fetchUserSubmissions(handle),
    ]);

    // Process contest data
    const contests = userRating.map((contest) => {
      return {
        contestId: contest.contestId,
        contestName: contest.contestName,
        rank: contest.rank,
        oldRating: contest.oldRating,
        newRating: contest.newRating,
        ratingChange: contest.newRating - contest.oldRating,
        date: new Date(contest.ratingUpdateTimeSeconds * 1000),
      };
    });

    // Process submission data
    const submissions = [];
    const solvedProblems = new Set();
    let lastSubmissionDate = null;

    for (const submission of userStatus) {
      // Skip submissions without problem data
      if (!submission.problem) continue;

      const submissionDate = new Date(submission.creationTimeSeconds * 1000);

      // Keep track of the last submission date
      if (!lastSubmissionDate || submissionDate > lastSubmissionDate) {
        lastSubmissionDate = submissionDate;
      }

      // Only track successful submissions or add all submissions
      const submissionData = {
        submissionId: submission.id,
        contestId: submission.problem.contestId,
        problemIndex: submission.problem.index,
        problemName: submission.problem.name,
        problemRating: submission.problem.rating || null,
        verdict: submission.verdict,
        submissionDate,
      };

      submissions.push(submissionData);

      // Count solved problems
      if (submission.verdict === "OK") {
        const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
        solvedProblems.add(problemId);
      }
    }

    // Process solved problems by rating
    const solvedByRating = {};
    submissions
      .filter((sub) => sub.verdict === "OK" && sub.problemRating)
      .forEach((sub) => {
        const ratingBucket = Math.floor(sub.problemRating / 100) * 100;
        solvedByRating[ratingBucket] = (solvedByRating[ratingBucket] || 0) + 1;
      });

    // Calculate unsolved problems for each contest
    for (const contest of contests) {
      // Get all problems for this contest
      const contestProblems = submissions
        .filter((sub) => sub.contestId === contest.contestId)
        .map((sub) => `${sub.contestId}-${sub.problemIndex}`);

      // Get unique problems
      const uniqueProblems = new Set(contestProblems);

      // Get solved problems for this contest
      const solvedContestProblems = submissions
        .filter(
          (sub) => sub.contestId === contest.contestId && sub.verdict === "OK"
        )
        .map((sub) => `${sub.contestId}-${sub.problemIndex}`);

      // Get unique solved problems
      const uniqueSolvedProblems = new Set(solvedContestProblems);

      // Calculate unsolved
      contest.unsolvedProblems =
        uniqueProblems.size - uniqueSolvedProblems.size;
    }

    // Save or update the data in the database
    const existingData = await StudentCodeforces.findOne({ studentId });

    if (existingData) {
      // Update existing record
      existingData.handle = handle;
      existingData.contests = contests;
      existingData.submissions = submissions;
      existingData.totalSolved = solvedProblems.size;
      existingData.solvedByRating = solvedByRating;
      existingData.lastSubmissionDate = lastSubmissionDate;
      await existingData.save();
    } else {
      // Create new record
      await StudentCodeforces.create({
        studentId,
        handle,
        contests,
        submissions,
        totalSolved: solvedProblems.size,
        solvedByRating,
        lastSubmissionDate,
      });
    }

    // Update student record with current and max ratings
    if (contests.length > 0) {
      // Sort contests by date (newest first)
      const sortedContests = [...contests].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // Get current rating from the most recent contest
      const currentRating = sortedContests[0].newRating || 0;

      // Calculate max rating
      const maxRating = contests.reduce(
        (max, contest) => Math.max(max, contest.newRating || 0),
        0
      );

      // Update student
      await Student.findByIdAndUpdate(studentId, {
        currentRating,
        maxRating,
        lastDataUpdate: new Date(),
      });
    }

    return true;
  } catch (error) {
    console.error(`Error fetching Codeforces data for ${handle}:`, error);
    throw error;
  }
};

// Check if a Codeforces user exists
exports.checkUserExists = async (handle) => {
  try {
    const response = await axios.get(`${CF_API_BASE}/user.info`, {
      params: { handles: handle },
    });

    return response.data.status === "OK" && response.data.result.length > 0;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.status === "FAILED"
    ) {
      return false; // User doesn't exist
    }
    throw error;
  }
};

// Fetch user info from Codeforces API
exports.fetchUserInfo = async (handle) => {
  try {
    const response = await axios.get(`${CF_API_BASE}/user.info`, {
      params: { handles: handle },
    });

    if (response.data.status !== "OK" || response.data.result.length === 0) {
      throw new Error("Failed to fetch user info");
    }

    return response.data.result[0];
  } catch (error) {
    console.error(`Error fetching user info for ${handle}:`, error);
    throw error;
  }
};

// Fetch user rating history from Codeforces API
exports.fetchUserRating = async (handle) => {
  try {
    const response = await axios.get(`${CF_API_BASE}/user.rating`, {
      params: { handle },
    });

    if (response.data.status !== "OK") {
      throw new Error("Failed to fetch user rating");
    }

    await delay(500); // Respect rate limits
    return response.data.result;
  } catch (error) {
    console.error(`Error fetching rating history for ${handle}:`, error);
    throw error;
  }
};

// Fetch user submissions from Codeforces API
exports.fetchUserSubmissions = async (handle) => {
  try {
    const response = await axios.get(`${CF_API_BASE}/user.status`, {
      params: { handle, from: 1, count: 1000 }, // Limit to the last 1000 submissions
    });

    if (response.data.status !== "OK") {
      throw new Error("Failed to fetch user submissions");
    }

    await delay(500); // Respect rate limits
    return response.data.result;
  } catch (error) {
    console.error(`Error fetching submissions for ${handle}:`, error);
    throw error;
  }
};

// Update all students' Codeforces data
exports.updateAllStudentsData = async () => {
  try {
    const students = await Student.find();
    console.log(
      `Starting Codeforces data sync for ${students.length} students...`
    );

    let successCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // Add some delay between each request to respect rate limits
        await delay(2000);
        await this.fetchAndSaveUserData(student._id, student.codeforcesHandle);
        successCount++;
      } catch (error) {
        console.error(
          `Error updating data for student ${student.name}:`,
          error
        );
        errorCount++;
      }
    }

    console.log(
      `Codeforces sync completed. Success: ${successCount}, Errors: ${errorCount}`
    );
    return { success: successCount, error: errorCount };
  } catch (error) {
    console.error("Error in bulk Codeforces data update:", error);
    throw error;
  }
};
