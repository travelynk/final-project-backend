import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { encodeBookingCode, decodeBookingCode } from '../hashids.js';
import Hashids from 'hashids';

jest.mock('hashids');

describe('Hashids Utils', () => {
  const mockHashidsEncode = jest.fn();
  const mockHashidsDecode = jest.fn();
  const mockHashidsInstance = { encode: mockHashidsEncode, decode: mockHashidsDecode };

  const mockSecret = 'mocked-secret';
  const mockId = 12345;
  const mockBookingCode = 'mockedCode';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HASHIDS_SECRET = mockSecret;
    Hashids.mockImplementation(() => mockHashidsInstance);
  });

  describe('encodeBookingCode', () => {
    it('should encode the given id into a booking code', async () => {
      mockHashidsEncode.mockReturnValue(mockBookingCode);

      const result = await encodeBookingCode(mockId);

      expect(Hashids).toHaveBeenCalledWith(mockSecret, 9);
      expect(mockHashidsEncode).toHaveBeenCalledWith(mockId);
      expect(result).toBe(mockBookingCode);
    });
  });

  describe('decodeBookingCode', () => {
    it('should decode the booking code into the original id', async () => {
      mockHashidsDecode.mockReturnValue([mockId]);

      const result = await decodeBookingCode(mockBookingCode);

      expect(Hashids).toHaveBeenCalledWith(mockSecret, 9);
      expect(mockHashidsDecode).toHaveBeenCalledWith(mockBookingCode);
      expect(result).toBe(mockId);
    });

    it('should return null if the decoded array is empty', async () => {
      mockHashidsDecode.mockReturnValue([]);

      const result = await decodeBookingCode(mockBookingCode);

      expect(Hashids).toHaveBeenCalledWith(mockSecret, 9);
      expect(mockHashidsDecode).toHaveBeenCalledWith(mockBookingCode);
      expect(result).toBeNull();
    });
  });
});