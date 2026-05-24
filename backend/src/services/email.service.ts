export const sendContestEmail = async (toEmail: string, contestName: string, platform: string, minutes: number, url: string) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.warn('[Email Service] RESEND_API_KEY not found in .env. Skipping email dispatch.');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Codeyx <notifications@codeyx.com>', // Replace with your verified Resend domain
        to: [toEmail],
        subject: `Reminder: ${contestName} starts in ${minutes} mins!`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px;">
            <h2 style="color: #333;">Contest Reminder! 🚀</h2>
            <p style="font-size: 16px; color: #555;">Hi there,</p>
            <p style="font-size: 16px; color: #555;">
              This is a quick reminder that the upcoming coding contest <strong>${contestName}</strong> on <strong>${platform}</strong> 
              is starting in exactly <strong>${minutes} minutes</strong>.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Go to Contest Page
              </a>
            </div>
            <p style="font-size: 14px; color: #888;">Good luck!<br>— The Codeyx Team</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email via Resend');
    }

    console.log(`[Email Service] Sent reminder to ${toEmail} for ${contestName}`);
  } catch (error: any) {
    console.error(`[Email Service] Error sending email to ${toEmail}:`, error.message);
  }
};
