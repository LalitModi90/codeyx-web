import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use SendGrid, AWS SES, or any other SMTP
  auth: {
    user: process.env.EMAIL_USER, // e.g. your-email@gmail.com
    pass: process.env.EMAIL_PASS, // e.g. 16-digit App Password from Google
  },
});

export const sendContestNotificationEmail = async (
  email: string, 
  contestName: string, 
  platform: string, 
  timeRemaining: string, 
  url: string
) => {
  try {
    const htmlTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #050816; color: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #333;">
        <h2 style="color: #FF8A00; text-align: center; margin-bottom: 30px;">Codeyx Contest Reminder</h2>
        
        <p style="font-size: 16px; color: #e5e7eb;">Hello Developer,</p>
        
        <p style="font-size: 16px; color: #e5e7eb;">
          Get ready! A coding contest is starting very soon. Time to warm up your problem-solving skills!
        </p>

        <div style="background-color: #101014; padding: 20px; border-radius: 8px; border: 1px solid #333; margin: 20px 0;">
          <p style="margin: 5px 0; color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Platform</p>
          <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #fff;">${platform}</p>

          <p style="margin: 5px 0; color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Contest</p>
          <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #fff;">${contestName}</p>

          <p style="margin: 5px 0; color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Starts In</p>
          <p style="margin: 0; font-size: 20px; font-weight: black; color: #FF8A00;">${timeRemaining}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${url}" style="background-color: #FF8A00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
            Go to Contest Page
          </a>
        </div>

        <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px;">
          © 2026 Codeyx Platform. You are receiving this because you opted into contest reminders.
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"Codeyx" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `[Reminder] ${timeRemaining} Left: ${contestName} on ${platform}`,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email} for contest: ${contestName}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const htmlTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #050816; color: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #333;">
        <h2 style="color: #FF8A00; text-align: center; margin-bottom: 20px;">Welcome to Codeyx!</h2>
        
        <p style="font-size: 16px; color: #e5e7eb;">Hi ${name || 'Developer'},</p>
        
        <p style="font-size: 16px; color: #e5e7eb; line-height: 1.5;">
          We are thrilled to have you onboard! Codeyx is your ultimate developer platform for tracking competitive programming stats, showcasing projects, and getting reminders for upcoming contests.
        </p>

        <div style="background-color: #101014; padding: 20px; border-radius: 8px; border: 1px solid #333; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #FF8A00;">What's Next?</h3>
          <ul style="color: #a1a1aa; line-height: 1.8;">
            <li>Connect your LeetCode, Codeforces & GitHub accounts.</li>
            <li>Build your unified developer portfolio.</li>
            <li>Never miss a contest with our auto-reminders.</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background-color: #FF8A00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
            Go to your Dashboard
          </a>
        </div>

        <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px;">
          © 2026 Codeyx Platform. Built for developers, by developers.
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"Codeyx" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to Codeyx, ${name || 'Developer'}!`,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Welcome Email] Sent successfully to ${email}`);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return null;
  }
};

export const sendAdminAlertEmail = async (subject: string, messageHtml: string) => {
  try {
    const adminEmail = process.env.EMAIL_USER;
    if (!adminEmail) return;

    const mailOptions = {
      from: `"Codeyx System" <${adminEmail}>`,
      to: adminEmail,
      subject: `[ADMIN ALERT] ${subject}`,
      html: messageHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Admin Alert] Email sent: ${subject}`);
    return info;
  } catch (error) {
    console.error('Error sending admin alert:', error);
    return null;
  }
};
