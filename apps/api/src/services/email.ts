import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEnquiryNotification(
  patientName: string,
  patientEmail: string,
  patientPhone: string,
  message: string
) {
  try {
    // Note: To send to external emails on the free tier, you must use onboarding@resend.dev
    await resend.emails.send({
      from: 'Clinic Enquiries <onboarding@resend.dev>', 
      to: 'wwwdanishmaliktech4488@gmail.com', // 👈 CHANGE THIS to your actual email to test!
      subject: `New Appointment Request from ${patientName}`,
      html: `
        <h2>New Enquiry Received</h2>
        <p><strong>Name:</strong> ${patientName}</p>
        <p><strong>Email:</strong> ${patientEmail}</p>
        <p><strong>Phone:</strong> ${patientPhone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message || 'No message provided.'}</p>
        <hr />
        <p><a href="http://localhost:5173/admin">Click here to log in to the dashboard</a></p>
      `,
    });
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    // We don't throw the error, so the enquiry still saves successfully even if email fails
  }
}