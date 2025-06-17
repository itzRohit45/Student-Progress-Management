const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  contestId: {
    type: Number,
    required: true,
  },
  contestName: {
    type: String,
    required: true,
  },
  rank: {
    type: Number,
  },
  oldRating: {
    type: Number,
  },
  newRating: {
    type: Number,
  },
  ratingChange: {
    type: Number,
  },
  date: {
    type: Date,
    required: true,
  },
  unsolvedProblems: {
    type: Number,
    default: 0,
  },
});

const submissionSchema = new mongoose.Schema({
  submissionId: {
    type: Number,
    required: true,
  },
  contestId: {
    type: Number,
  },
  problemIndex: {
    type: String,
  },
  problemName: {
    type: String,
  },
  problemRating: {
    type: Number,
  },
  verdict: {
    type: String,
  },
  submissionDate: {
    type: Date,
    required: true,
  },
});

const studentCodeforcesSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    handle: {
      type: String,
      required: true,
    },
    contests: [contestSchema],
    submissions: [submissionSchema],
    totalSolved: {
      type: Number,
      default: 0,
    },
    solvedByRating: {
      type: Map,
      of: Number,
      default: {},
    },
    lastSubmissionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const StudentCodeforces = mongoose.model(
  "StudentCodeforces",
  studentCodeforcesSchema
);

module.exports = StudentCodeforces;
