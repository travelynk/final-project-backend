import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { authenticator } from "otplib";
import { generateOTP, verifyOTP, generateSecret } from "../otp.js";

jest.mock('otplib', () => {
  const originalModule = jest.requireActual('otplib');
  return {
    ...originalModule,
    authenticator: {
      generate: jest.fn(),
      check: jest.fn(),
      generateSecret: jest.fn(),
      options: {},
    },
  };
});

describe('Utils - OTP functions', () => {
  const mockSecret = 'mocked-secret';
  const mockOTP = '123456';

  beforeEach(() => {
    jest.clearAllMocks();
    authenticator.options = { step: 300 }; // Ensure default options are reset
  });

  describe('generateOTP', () => {
    it('should generate an OTP using the provided secret', () => {
      authenticator.generate.mockReturnValue(mockOTP);

      const otp = generateOTP(mockSecret);

      expect(authenticator.generate).toHaveBeenCalledWith(mockSecret);
      expect(otp).toBe(mockOTP);
    });
  });

  describe('verifyOTP', () => {
    it('should verify the OTP with the provided secret', () => {
      authenticator.check.mockReturnValue(true);

      const isValid = verifyOTP(mockOTP, mockSecret);

      expect(authenticator.check).toHaveBeenCalledWith(mockOTP, mockSecret);
      expect(isValid).toBe(true);
    });

    it('should return false if OTP verification fails', () => {
      authenticator.check.mockReturnValue(false);

      const isValid = verifyOTP(mockOTP, mockSecret);

      expect(authenticator.check).toHaveBeenCalledWith(mockOTP, mockSecret);
      expect(isValid).toBe(false);
    });
  });

  describe('generateSecret', () => {
    it('should generate a secret', () => {
      authenticator.generateSecret.mockReturnValue(mockSecret);

      const secret = generateSecret();

      expect(authenticator.generateSecret).toHaveBeenCalled();
      expect(secret).toBe(mockSecret);
    });
  });
});
