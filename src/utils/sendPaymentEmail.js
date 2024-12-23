import nodemailer from "nodemailer";

export const sendPaymentEmail = async (email, subject, htmlContent) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailData = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: htmlContent,
    };

    const info = await transporter.sendMail(mailData);

    return { messageId: info.messageId };
};