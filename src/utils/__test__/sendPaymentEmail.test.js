import { jest, describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import nodemailer from 'nodemailer';
import { sendPaymentEmail } from '../sendPaymentEmail.js';

// Mock nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn()
}));

describe("sendPaymentEmail", () => {
  let mockSendMail;

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({
      messageId: "12345"
    });

    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send an email and return the messageId", async () => {
    // Arrange
    const email = "test@example.com";
    const subject = "Payment Confirmation";
    const htmlContent = "<h1>Your payment was successful</h1>";

    // Act
    const result = await sendPaymentEmail(email, subject, htmlContent);

    // Assert
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent
    });

    expect(result).toEqual({ messageId: "12345" });
  });

  it("should throw an error if sendMail fails", async () => {
    // Arrange
    const email = "test@example.com";
    const subject = "Payment Confirmation";
    const htmlContent = "<h1>Your payment was successful</h1>";

    const error = new Error("Failed to send email");
    mockSendMail.mockRejectedValueOnce(error);

    // Act & Assert
    await expect(sendPaymentEmail(email, subject, htmlContent)).rejects.toThrow("Failed to send email");

    expect(mockSendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent
    });
  });
});