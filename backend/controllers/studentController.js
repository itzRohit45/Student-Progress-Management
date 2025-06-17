const Student = require("../models/Student");
const StudentCodeforces = require("../models/StudentCodeforces");
const codeforcesService = require("../services/codeforcesService");

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch students", error: error.message });
  }
};

// Get single student by ID
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch student", error: error.message });
  }
};

// Create new student
exports.createStudent = async (req, res) => {
  try {
    let { name, email, phoneNumber, codeforcesHandle } = req.body;

    // Trim the input fields
    name = name.trim();
    email = email.trim();
    if (phoneNumber) phoneNumber = phoneNumber.trim();

    // Extract handle from URL if full URL is provided
    if (codeforcesHandle) {
      codeforcesHandle = codeforcesHandle.trim();
      // Check if it's a full Codeforces URL and extract the handle
      const handleMatch = codeforcesHandle.match(
        /codeforces\.com\/profile\/([^\/\s]+)/i
      );
      if (handleMatch) {
        codeforcesHandle = handleMatch[1];
      }
    }

    // Improved email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Check for existing student with same email or handle
    const existingStudent = await Student.findOne({
      $or: [{ email }, { codeforcesHandle }],
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student with this email or Codeforces handle already exists",
      });
    }

    // Create the student
    const newStudent = await Student.create({
      name,
      email,
      phoneNumber,
      codeforcesHandle,
      lastDataUpdate: new Date(),
    });

    // Fetch Codeforces data asynchronously
    try {
      await codeforcesService.fetchAndSaveUserData(
        newStudent._id,
        codeforcesHandle
      );

      // Update student with Codeforces ratings
      const cfData = await StudentCodeforces.findOne({
        studentId: newStudent._id,
      });
      if (cfData && cfData.contests.length > 0) {
        // Get the most recent contest
        const latestContest = cfData.contests.sort(
          (a, b) => b.date - a.date
        )[0];

        // Update the student with the current and max rating
        await Student.findByIdAndUpdate(newStudent._id, {
          currentRating: latestContest.newRating || 0,
          maxRating: cfData.contests.reduce(
            (max, contest) => Math.max(max, contest.newRating || 0),
            0
          ),
        });
      }
    } catch (cfError) {
      console.error("Error fetching Codeforces data:", cfError);
      // Continue with student creation even if CF data fetching fails
    }

    const updatedStudent = await Student.findById(newStudent._id);
    res.status(201).json(updatedStudent);
  } catch (error) {
    console.error("Error creating student:", error);
    res
      .status(500)
      .json({ message: "Failed to create student", error: error.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    let { name, email, phoneNumber, codeforcesHandle, disableReminders } =
      req.body;
    const studentId = req.params.id;

    // Trim the input fields
    if (name) name = name.trim();
    if (email) email = email.trim();
    if (phoneNumber) phoneNumber = phoneNumber.trim();

    // Process Codeforces handle if provided
    if (codeforcesHandle) {
      codeforcesHandle = codeforcesHandle.trim();
      // Check if it's a full Codeforces URL and extract the handle
      const handleMatch = codeforcesHandle.match(
        /codeforces\.com\/profile\/([^\/\s]+)/i
      );
      if (handleMatch) {
        codeforcesHandle = handleMatch[1];
      }
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Improved email validation
    if (
      email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Check if Codeforces handle has changed
    const handleChanged = student.codeforcesHandle !== codeforcesHandle;

    // Check for duplicate email or handle (but exclude the current student)
    if (email || codeforcesHandle) {
      const query = {
        _id: { $ne: studentId },
        $or: [],
      };

      if (email) query.$or.push({ email });
      if (codeforcesHandle) query.$or.push({ codeforcesHandle });

      if (query.$or.length > 0) {
        const existingStudent = await Student.findOne(query);
        if (existingStudent) {
          return res.status(400).json({
            message:
              "Email or Codeforces handle already in use by another student",
          });
        }
      }
    }

    // Update the student
    let updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      ...(codeforcesHandle && { codeforcesHandle }),
      ...(disableReminders !== undefined && { disableReminders }),
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true, runValidators: true }
    );

    // If handle changed, fetch new data
    if (handleChanged && codeforcesHandle) {
      try {
        await codeforcesService.fetchAndSaveUserData(
          studentId,
          codeforcesHandle
        );

        // Update student with new Codeforces ratings
        const cfData = await StudentCodeforces.findOne({ studentId });
        if (cfData && cfData.contests.length > 0) {
          const latestContest = cfData.contests.sort(
            (a, b) => b.date - a.date
          )[0];

          await Student.findByIdAndUpdate(
            studentId,
            {
              currentRating: latestContest.newRating || 0,
              maxRating: cfData.contests.reduce(
                (max, contest) => Math.max(max, contest.newRating || 0),
                0
              ),
              lastDataUpdate: new Date(),
            },
            { new: true }
          );
        }
      } catch (cfError) {
        console.error("Error updating Codeforces data:", cfError);
        // Continue with student update even if CF data fetching fails
      }
    }

    const finalStudent = await Student.findById(studentId);
    res.status(200).json(finalStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    res
      .status(500)
      .json({ message: "Failed to update student", error: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Delete the student
    const result = await Student.findByIdAndDelete(studentId);
    if (!result) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Also delete associated Codeforces data
    await StudentCodeforces.findOneAndDelete({ studentId });

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res
      .status(500)
      .json({ message: "Failed to delete student", error: error.message });
  }
};

// Export all students data as CSV
exports.exportStudentsCSV = async (req, res) => {
  try {
    const students = await Student.find();

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    // Create CSV header
    const csvHeader =
      "Name,Email,Phone Number,Codeforces Handle,Current Rating,Max Rating,Last Updated,Reminders Disabled,Reminders Sent\n";

    // Create CSV rows
    const csvRows = students
      .map((student) => {
        return `"${student.name}","${student.email}","${
          student.phoneNumber || ""
        }","${student.codeforcesHandle}",${student.currentRating},${
          student.maxRating
        },"${student.lastDataUpdate.toISOString()}",${
          student.disableReminders
        },${student.remindersSent}`;
      })
      .join("\n");

    // Complete CSV content
    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=students.csv");

    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting students as CSV:", error);
    res
      .status(500)
      .json({ message: "Failed to export students", error: error.message });
  }
};

// Reset reminder count for student
exports.resetReminderCount = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.remindersSent = 0;
    student.lastReminderDate = null;
    await student.save();

    res.status(200).json(student);
  } catch (error) {
    console.error("Error resetting reminder count:", error);
    res.status(500).json({
      message: "Failed to reset reminder count",
      error: error.message,
    });
  }
};

// Toggle reminder status for student
exports.toggleReminders = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.disableReminders = !student.disableReminders;
    await student.save();

    res.status(200).json(student);
  } catch (error) {
    console.error("Error toggling reminders status:", error);
    res.status(500).json({
      message: "Failed to toggle reminders status",
      error: error.message,
    });
  }
};
