const cron = require("node-cron");
const codeforcesService = require("./codeforcesService");
const emailService = require("./emailService");
const Config = require("../models/Config");
const Student = require("../models/Student");
const StudentCodeforces = require("../models/StudentCodeforces");

let codeforcesDataJob;

// Initialize cron jobs
exports.initializeCronJobs = async () => {
  try {
    // Get the cron schedule from config or use default (2 AM daily)
    const configDoc = await Config.findOne({
      name: "CODEFORCES_SYNC_SCHEDULE",
    });
    const cronSchedule = configDoc
      ? configDoc.value
      : process.env.CODEFORCES_SYNC_SCHEDULE || "0 2 * * *";

    console.log(
      `Setting up Codeforces sync cron job with schedule: ${cronSchedule}`
    );

    // Schedule the job
    codeforcesDataJob = cron.schedule(cronSchedule, async () => {
      console.log("Running scheduled Codeforces data sync...");

      try {
        // Update all students' Codeforces data
        await codeforcesService.updateAllStudentsData();

        // Check for inactive students and send reminders
        await this.checkInactiveStudents();

        console.log("Scheduled sync completed successfully");
      } catch (error) {
        console.error("Error during scheduled Codeforces sync:", error);
      }
    });

    console.log("Cron jobs initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing cron jobs:", error);
    throw error;
  }
};

// Update cron schedule
exports.updateCronSchedule = async (newSchedule) => {
  try {
    if (!cron.validate(newSchedule)) {
      throw new Error(`Invalid cron schedule: ${newSchedule}`);
    }

    console.log(`Updating Codeforces sync cron schedule to: ${newSchedule}`);

    // Stop existing job if it exists
    if (codeforcesDataJob) {
      codeforcesDataJob.stop();
    }

    // Create new job with updated schedule
    codeforcesDataJob = cron.schedule(newSchedule, async () => {
      console.log(
        "Running scheduled Codeforces data sync with updated schedule..."
      );

      try {
        // Update all students' Codeforces data
        await codeforcesService.updateAllStudentsData();

        // Check for inactive students and send reminders
        await this.checkInactiveStudents();

        console.log("Scheduled sync completed successfully");
      } catch (error) {
        console.error("Error during scheduled Codeforces sync:", error);
      }
    });

    // Update config in database
    await Config.findOneAndUpdate(
      { name: "CODEFORCES_SYNC_SCHEDULE" },
      { value: newSchedule, lastUpdated: new Date() },
      { upsert: true }
    );

    return true;
  } catch (error) {
    console.error("Error updating cron schedule:", error);
    throw error;
  }
};

// Check for inactive students and send reminders
exports.checkInactiveStudents = async () => {
  try {
    // Get configurations
    const [inactivityThresholdConfig, maxRemindersConfig] = await Promise.all([
      Config.findOne({ name: "INACTIVITY_DAYS_THRESHOLD" }),
      Config.findOne({ name: "MAX_REMINDERS_PER_STUDENT" }),
    ]);

    const inactivityThreshold = inactivityThresholdConfig
      ? inactivityThresholdConfig.value
      : 7; // Default: 7 days
    const maxReminders = maxRemindersConfig ? maxRemindersConfig.value : 3; // Default: 3 reminders

    console.log(
      `Checking for students inactive for ${inactivityThreshold} days...`
    );

    // Calculate the threshold date
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - inactivityThreshold);

    // Get all students with reminders enabled
    const students = await Student.find({ disableReminders: false });

    let remindersSent = 0;

    for (const student of students) {
      try {
        // Skip students who have reached the maximum number of reminders
        if (student.remindersSent >= maxReminders) {
          continue;
        }

        // Get student's Codeforces data
        const cfData = await StudentCodeforces.findOne({
          studentId: student._id,
        });

        // Skip if no Codeforces data exists or no submission date is recorded
        if (!cfData || !cfData.lastSubmissionDate) {
          console.log(
            `Skipping ${student.name} (${student.email}): No submission data available`
          );
          continue;
        }

        // Check if the student has never made a submission (no submissions array or empty array)
        if (!cfData.submissions || cfData.submissions.length === 0) {
          console.log(
            `Skipping ${student.name} (${student.email}): No submissions recorded`
          );
          continue;
        }

        // Check if the student is inactive
        const lastSubmission = new Date(cfData.lastSubmissionDate);

        if (lastSubmission < thresholdDate) {
          console.log(
            `Student ${student.name} (${student.email}) is inactive. Last submission: ${lastSubmission}`
          );

          // Attempt to send reminder email
          const result = await emailService.sendInactivityReminder(
            student,
            lastSubmission
          );

          if (result.success) {
            // Update reminder count
            student.remindersSent += 1;
            student.lastReminderDate = new Date();
            await student.save();

            remindersSent++;
            console.log(
              `Reminder email sent successfully to ${student.email}, messageId: ${result.messageId}`
            );
          } else {
            console.log(
              `Failed to send reminder email to ${student.email}: ${result.error}`
            );
          }
        } else {
          console.log(
            `Student ${student.name} (${student.email}) is active. Last submission: ${lastSubmission}, Threshold: ${thresholdDate}`
          );
        }
      } catch (studentError) {
        console.error(`Error processing student ${student._id}:`, studentError);
        // Continue to next student even if there's an error
      }
    }

    console.log(`Inactivity check completed. Sent ${remindersSent} reminders.`);
    return { remindersSent };
  } catch (error) {
    console.error("Error checking for inactive students:", error);
    throw error;
  }
};
