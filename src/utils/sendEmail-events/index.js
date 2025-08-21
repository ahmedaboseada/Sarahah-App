import { EventEmitter } from "events";
import { sendEmail } from "../sendEmail.js";
import jwt from "jsonwebtoken";
export const eventEmitter = new EventEmitter();
const PORT = process.env.PORT || 3000;

eventEmitter.on("sendEmail", async (data) => {
    const token = await jwt.sign({ email: data.email }, process.env.JWT_EMAIL_CONFIRM_SECRET, { expiresIn: '5m' });
    const confirmLink = `http://localhost:${PORT}/users/confirmEmail/${token}`;

    const emailStatus = await sendEmail({
        to: data.email,
        subject: 'Confirm Your Email',
        name: data.name,
        message: `Please confirm your email by clicking the link below:<br/><a href="${confirmLink}" class="button">Confirm Email</a>`
    });
})

eventEmitter.on('sendOTP', async (data) => {
    const { email, otp, name } = data

    const emailStatus = await sendEmail({
        to: email,
        subject: 'Your OTP',
        name,
        message: `Your OTP is ${otp}`
    });
})