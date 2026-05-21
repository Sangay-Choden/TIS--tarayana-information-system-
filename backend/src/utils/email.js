const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 👇 ADD THIS RIGHT HERE (after transporter creation)
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

/**
 * Sends credentials to a newly created user
 */
const sendEmail = async (to, role, password) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Your Account Password - Tarayana Information System",
      text: `Your account has been created.

Email: ${to}
Role: ${role}
Password: ${password}

Please login and change your password immediately for security purposes.`
    });
    console.log(`📧 Account email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Error sending account email:", error);
    throw error;
  }
};

/**
 * Sends a notification when an officer is assigned to a project/dzongkhag
 */
const sendProjectAssignmentEmail = async (to, officerName, projectName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "New Project Assignment - Tarayana Information System",
      text: `Dear ${officerName},

You have been appointed as the Field Officer for the project: "${projectName}".

Please log in to the system to view the project details and manage the beneficiaries for your assigned area.

Best regards,
Tarayana Admin Team`
    });
    console.log(`📧 Assignment email sent to: ${to} for project: ${projectName}`);
  } catch (error) {
    console.error("❌ Error sending assignment email:", error);
    // We don't necessarily want to crash the whole request if the email fails, 
    // so we just log the error here.
  }
};







/**
 * Sends a high-priority alert when C&D verification doesn't match beneficiary data
 */
const sendDataMismatchAlert = async (to, projectName, report, remark) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `DATA ALERT: Discrepancy in ${projectName}`,
      text: `Dear Officer,

A discrepancy has been detected during the C&D verification process for the project: "${projectName}".

Verification Details:
${report}

Additional Remarks from Monitoring Team:
"${remark}"

Please review the beneficiary entries and the physical implementation to resolve these differences.

Best regards,
Tarayana Monitoring Team`
    });
    console.log(`📧 Data alert sent to: ${to}`);
  } catch (error) {
    console.error("❌ Error sending data alert email:", error);
  }
};

// Remember to add it to your exports!
module.exports = {
  sendEmail,
  sendProjectAssignmentEmail,
  sendDataMismatchAlert
};

// const nodemailer = require("nodemailer");

// const sendEmail = async (to,role, password) => {

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to,
//     subject: "Your Account Password",
//     text: `Your account has been created.

// Email: ${to}
// Role:${role}
// Password: ${password}

// Please login and change your password.`
//   });

// };

// // NEW: Project Appointment Email

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });


// const sendProjectAssignmentEmail = async (to, officerName, projectName) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to,
//     subject: "New Project Assignment - Tarayana Information System",
//     text: `Dear ${officerName},

// You have been appointed as the Field Officer for the project: "${projectName}".

// Please log in to the system to view the project details and manage the beneficiaries.

// Best regards,
// Tarayana Admin Team`
//   });
// };



// module.exports = {
//   sendEmail,
//   sendProjectAssignmentEmail
// };