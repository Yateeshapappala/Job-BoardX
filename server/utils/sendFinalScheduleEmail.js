const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendFinalScheduleEmail = async (to, dateTime, team, name, jobTitle) => {
  const formattedTime = new Date(dateTime).toLocaleString();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Interview Scheduled for ${jobTitle}`,
    html: `
      <p>Hi ${name},</p>
      <p>Your interview for the position <strong>${jobTitle}</strong> has been scheduled.</p>
      <ul>
        <li><strong>Date & Time:</strong> ${formattedTime}</li>
        <li><strong>Panel:</strong> Team ${team + 1}</li>
      </ul>
      <p>Please be available at that time.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendFinalScheduleEmail;
