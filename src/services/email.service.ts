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
        `,
        'order-confirmation': `
            <h2>Order Confirmation</h2>
            <p>Your order has been placed successfully!</p>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Total Amount:</strong> ৳${data.totalAmount}</p>
            <p><strong>Items:</strong> ${data.items}</p>
            <p>Thank you for your purchase!</p>
        `,
        'payment-confirmation': `
            <h2>Payment Confirmed</h2>
            <p>Your payment has been processed successfully!</p>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Amount:</strong> ৳${data.amount}</p>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p>Your order is now being processed.</p>
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