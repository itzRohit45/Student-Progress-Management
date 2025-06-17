const nodemailer = require("nodemailer");

// Email validation function
const isValidEmail = (email) => {
  // More thorough email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Create transporter object
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Send inactivity reminder email
exports.sendInactivityReminder = async (student, lastSubmissionDate) => {
  try {
    // Validate email before sending
    if (!student.email || !isValidEmail(student.email)) {
      console.error(
        `Invalid email for student ${student.name} (${student._id}): ${student.email}`
      );
      return { success: false, message: "Invalid email address" };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: "Reminder: Stay Active in Problem Solving",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4a4a4a;">Hello ${student.name},</h2>
          
          <p>We noticed that you haven't solved any problems on Codeforces since <strong>${formatDate(
            lastSubmissionDate
          )}</strong>.</p>
          
          <p>Consistent practice is key to improving your problem-solving skills. We encourage you to get back to solving problems regularly.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tips to stay consistent:</strong></p>
            <ul>
              <li>Set a goal to solve at least one problem daily</li>
              <li>Participate in weekly contests</li>
              <li>Focus on topics you find challenging</li>
              <li>Join study groups with your peers</li>
            </ul>
          </div>
          
          <p>If you need any help or have questions, please don't hesitate to reach out.</p>
          
          <p>Happy Coding!</p>
          <hr>
          <p style="font-size: 12px; color: #777;">
            This is an automated reminder. You've received ${
              student.remindersSent + 1
            } reminder(s) so far.
            If you'd like to stop receiving these reminders, please contact your instructor.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Inactivity reminder sent to ${student.email}, messageId: ${info.messageId}`
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      `Error sending inactivity reminder to ${student.email}:`,
      error
    );
    return { success: false, error: error.message };
  }
};
