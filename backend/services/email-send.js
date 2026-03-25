import { Resend } from 'resend';
import { ENV } from '../env.js';
const resend = new Resend(ENV.VOTING_EMAIL_API);

export async function sendEmail(userEmail,subject) {
  const { data, error } = await resend.emails.send({
    from: 'Chitkara Voting <onboarding@resend.dev>',
    to: `${userEmail}`,
    subject: 'Otp',
    html: `Your otp is: <strong>${subject}</strong>`,
  });

  if (error) {
     console.log({ error });
  }
  return data;
}