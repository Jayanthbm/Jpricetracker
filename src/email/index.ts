import { EmailSend } from "../types";

const nodemailer = require("nodemailer");

//Email Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (emailContext: EmailSend): Promise<boolean> => {
  try {
    let info = await transporter.sendMail(emailContext);
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.log("Error in sendig Email", error);
    return false;
  }
}