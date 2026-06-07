import { Resend } from 'resend';
import { ENV } from '../env.js';
import nodemailer from "nodemailer"
import dns from 'node:dns';

dns.setDefaultResultOrder("ipv4first");
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

export async function sendMail(userEmail, otp) {
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: `${ENV.EMAIL_NAME}`,
            pass: ENV.EMAIL_APP_PASSWORD
        }
    });
    await transport.sendMail({
        from: `"Chitkara Voting" <${ENV.EMAIL_NAME}>`,
        to: `${userEmail}`,
        subject: "OTP",
        html: `Your OTP is: <strong>${otp}</strong>`
    })
}
export async function sendMailAdmin(adminName,adminEmail,pass,branch){
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: `${ENV.EMAIL_NAME}`,
            pass: ENV.EMAIL_APP_PASSWORD
        }
    });
    transport.sendMail({
        from: `"Chitkara Voting" <${ENV.EMAIL_NAME}>`,
        to: `${adminEmail}`,
        subject: "admin",
        html: `Hey <strong>${adminName}</strong> you are now admin of <strong>${branch}</strong> branch with password: <strong>${pass}<strong/>`
    })

}

export const sendWinnerMail = (adminName,adminEmail,branch,year,presName,vPresName)=>{
        const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: `${ENV.EMAIL_NAME}`,
            pass: ENV.EMAIL_APP_PASSWORD
        }
    });
        transport.sendMail({
        from: `"Chitkara Voting" <${ENV.EMAIL_NAME}>`,
        to: `${adminEmail}`,
        subject: `Winner of ${branch} branch  `,
        html: `<strong>${presName}</strong> is elected as President and <strong>${vPresName}</strong> is elected as vice President for year <strong>${year}</strong>`
    });
        transport.sendMail({
        from: `"Chitkara Voting" <${ENV.EMAIL_NAME}>`,
        to: `${adminEmail}`,
        subject: `Winner of ${branch} branch  `,
        html: `<strong>${presName}<strong/> is elected as President and <strong>${vPresName}<strong/> is elected as vice President`
    })
}
export async function sendRevokeMailAdmin(adminName,adminEmail,branch){
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: `${ENV.EMAIL_NAME}`,
            pass: ENV.EMAIL_APP_PASSWORD
        }
    });
    transport.sendMail({
        from: `"Chitkara Voting" <${ENV.EMAIL_NAME}>`,
        to: `${adminEmail}`,
        subject: "admin",
        html: `Hey <strong> ${adminName}</strong> you are no more admin of ${branch} branch`
    })

}