const nodemailer = require('nodemailer');

async function sendInterviewInvitationEmail(toEmail, availabilityLink, applicantName, jobTitle) {
  // Configure your SMTP transporter here
  // For testing you can use ethereal.email or your real SMTP provider
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,       // e.g. smtp.gmail.com
    port: process.env.SMTP_PORT,       // e.g. 587
    secure: false,                     // true for 465, false for other ports
    auth: {  
       user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
    },
  });

  // Email content
  const mailOptions = {
    from: `"HiringHood" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Interview Availability Request for ${jobTitle}`,
    html: `
      <p>Hi ${applicantName},</p>
      <p>Congratulations! You have been shortlisted for the position of <strong>${jobTitle}</strong>.</p>
      <p>Please submit your available interview time slots by clicking the link below:</p>
      <p><a href="${availabilityLink}">Submit Interview Availability</a></p>
      <p>If you did not expect this email, please ignore it.</p>
      <br/>
      <p>Best regards,<br/>HiringHood Team</p>
    `,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log('Interview invitation email sent:', info.messageId);
}

module.exports = sendInterviewInvitationEmail;
