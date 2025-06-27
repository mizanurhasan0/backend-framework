import nodemailer from 'nodemailer';
import { config } from '../config';

interface EmailData {
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
}

// Create transporter
const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.pass,
    },
});

// Simple template function
const getTemplate = (template: string, data: Record<string, any>): string => {
    const templates: Record<string, string> = {
        'email-verification': `
            <h2>Hello ${data.name}!</h2>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${data.verificationUrl}">Verify Email</a>
        `,
        'password-reset': `
            <h2>Hello ${data.name}!</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${data.resetUrl}">Reset Password</a>
        `
    };

    return templates[template] || 'Email content';
};

export const sendEmail = async (emailData: EmailData): Promise<void> => {
    const html = getTemplate(emailData.template, emailData.data);

    await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'App'}" <${config.mail.auth.user}>`,
        to: emailData.to,
        subject: emailData.subject,
        html
    });
}; 