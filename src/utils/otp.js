import { authenticator } from "otplib";

authenticator.options = { step: 300 };

export const generateOTP = (secret) => authenticator.generate(secret);

export const verifyOTP = (otp, secret) => authenticator.check(otp, secret);

export const generateSecret = () => authenticator.generateSecret();
