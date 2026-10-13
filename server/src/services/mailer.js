const nodemailer = require('nodemailer');

let transporter = null;

// Configure SMTP transporter if env vars provided, or use fallback test/logging transport
function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development / fallback transporter that logs to console
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n================== [EMAIL DISPATCHED] ==================');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`From: ${mailOptions.from || 'CareerAI Placements <no-reply@careerai.edu>'}`);
        console.log('-------------------------------------------------------');
        console.log(mailOptions.text || mailOptions.html);
        console.log('========================================================\n');
        return {
          messageId: 'mock-' + Date.now() + '@careerai.edu',
          accepted: [mailOptions.to],
          response: '250 Mock email accepted and delivered',
        };
      },
    };
  }
  return transporter;
}

/**
 * Sends a structured One-on-One interview invitation email to the applicant
 */
async function sendOneOnOneInvite({
  applicantEmail,
  applicantName,
  companyName,
  jobTitle,
  meetingDate,
  meetingTime,
  meetingLink,
  interviewerName,
  instructions,
}) {
  const mail = getTransporter();

  const formattedDate = meetingDate ? new Date(meetingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'To be confirmed';

  const subject = `Invitation: One-on-One Interview with ${companyName} for ${jobTitle}`;

  const textBody = `
Dear ${applicantName},

Congratulations! You have been shortlisted for the role of "${jobTitle}" at ${companyName}.

We are pleased to invite you to a One-on-One Interview round.

Interview Details:
- Company: ${companyName}
- Position: ${jobTitle}
- Date: ${formattedDate}
- Time: ${meetingTime || 'As scheduled'}
- Interviewer: ${interviewerName || 'Technical Recruitment Panel'}
- Meeting Link / Location: ${meetingLink || 'To be shared before the call'}

Instructions / Notes:
${instructions || 'Please ensure a quiet environment, a stable internet connection, and have your resume and code samples ready.'}

Best regards,
${interviewerName ? interviewerName + ' & ' : ''}${companyName} Recruitment Team
Powered by CareerAI Placement System
  `.trim();

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
  <div style="border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #0f172a; margin: 0; font-size: 22px;">Career<span style="color: #ef4444;">AI</span> Interview Invitation</h2>
    <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Official Recruitment Notice</p>
  </div>

  <p style="font-size: 16px; line-height: 1.5;">Dear <strong>${applicantName}</strong>,</p>
  <p style="font-size: 15px; line-height: 1.6; color: #334155;">
    Congratulations! Following your application review, <strong>${companyName}</strong> has shortlisted you and scheduled your <strong>One-on-One Interview</strong> for the <strong>${jobTitle}</strong> position.
  </p>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">📅 Interview Schedule & Access</h3>
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; color: #64748b; width: 140px;">Company:</td>
        <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${companyName}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b;">Job Role:</td>
        <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${jobTitle}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b;">Date:</td>
        <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${formattedDate}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b;">Time:</td>
        <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${meetingTime || 'As scheduled'}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b;">Interviewer:</td>
        <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${interviewerName || 'Hiring Manager'}</td>
      </tr>
    </table>

    ${meetingLink ? `
    <div style="margin-top: 16px; text-align: center;">
      <a href="${meetingLink}" target="_blank" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 10px 24px; font-weight: 600; border-radius: 6px; font-size: 14px;">
        Join Interview Meeting
      </a>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">Link: ${meetingLink}</p>
    </div>` : ''}
  </div>

  ${instructions ? `
  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0;">
    <p style="margin: 0; font-size: 13px; color: #991b1b;"><strong>Recruiter Notes / Instructions:</strong></p>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #7f1d1d;">${instructions}</p>
  </div>` : ''}

  <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
    Good luck with your interview preparation!<br/>
    <strong>${companyName} Talent Acquisition Team</strong>
  </p>
</div>
  `.trim();

  const info = await mail.sendMail({
    from: process.env.EMAIL_FROM || `"${companyName} Recruiter" <placements@careerai.edu>`,
    to: applicantEmail,
    subject,
    text: textBody,
    html: htmlBody,
  });

  return {
    success: true,
    messageId: info.messageId,
    recipient: applicantEmail,
    subject,
    textBody,
  };
}

module.exports = {
  sendOneOnOneInvite,
};
