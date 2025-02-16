const nodeMailer = require("nodemailer");
const catchAsyncError = require("../middlewares/catchAsyncErrors");
// const { options } = require("../app");
const sendEmail = async (options) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD // Use 'pass' instead of 'password'
            }
        });

        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        // Handle the error appropriately (e.g., log, throw, etc.)
        throw new Error(`Error sending email: ${error.message}`);
    }
};
module.exports = sendEmail;