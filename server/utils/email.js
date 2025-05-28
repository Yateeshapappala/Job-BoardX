const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendSurveyEmail = async (recipientEmail, survey) => {
  const link = `${process.env.CLIENT_URL}/surveys/respond/${survey._id}?email=${encodeURIComponent(recipientEmail)}`;
  const employerName = survey.employer?.name || "Your HR Team";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #4A90E2;">📋 ${survey.title}</h2>
        <p>Hello,</p>
        <p><strong>${employerName}</strong> has invited you to take a short survey. Your feedback helps us grow together.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #4A90E2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Respond to Survey
          </a>
        </div>

        <!-- Uncomment if you want to include a deadline -->
        <!-- <p><strong>Deadline:</strong> Please complete the survey by <em>May 30, 2025</em>.</p> -->

        <p>Thank you!</p>
        <p style="color: gray; font-size: 12px;">This email was sent by JobBoardX on behalf of ${employerName}</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: '"JobBoardX HR" <no-reply@jobboardx.com>',
    to: recipientEmail,
    subject: `📋 New Survey from ${employerName}: ${survey.title}`,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Survey email sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`Failed to send survey email to ${recipientEmail}`, error);
  }
};
