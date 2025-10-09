import nodemailer from "nodemailer";

export const sendMail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', 
            port: 465,             
            secure: true,          
            auth: {
                user: process.env.GMAIL_USER, 
                pass: process.env.GMAIL_APP_PASSWORD, 
            },
        });
        
        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER, 
            to,
            subject,
            text, 
        });
        
        console.log("Message sent:", info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        throw error;
    }
}