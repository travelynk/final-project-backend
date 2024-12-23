import { describe, it, expect } from '@jest/globals';
import { formatTime, formatedDateAndYear, formatedDate } from '../formatTime.js';

describe('Time Utils', () => {
  describe('formatTime', () => {
    it('should correctly format a UTC date string to Jakarta time', () => {
      const utcDateStr = '2024-12-23T12:00:00Z'; // Example UTC date string
      const result = formatTime(utcDateStr);

      expect(result).toEqual({
        date: '2024-12-23', // Adjust as needed based on Jakarta time
        time: '19:00',     // Adjust as needed based on Jakarta time
      });
    });

    it('should handle invalid date strings gracefully', () => {
      const invalidDateStr = 'invalid-date';
      const result = formatTime(invalidDateStr);
      expect(result.date).toBe('NaN-NaN-NaN');
      expect(result.time).toBe('NaN:NaN');
    });
  });

  describe('formatedDateAndYear', () => {
    it('should correctly format an ISO string to a localized date and year', async () => {
      const isoString = '2024-12-23T12:00:00Z';
      const result = await formatedDateAndYear(isoString);

      expect(result).toBe('23 Desember 2024 pukul 12.00'); // Adjust for locale-specific output
    });

    it('should return a valid string even for invalid ISO strings', async () => {
      const invalidIsoString = 'invalid-date';
      const result = await formatedDateAndYear(invalidIsoString);
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatedDate', () => {
    it('should correctly format an ISO string to a localized date without year', async () => {
      const isoString = '2024-12-23T12:00:00Z';
      const result = await formatedDate(isoString);

      expect(result).toBe('23 Desember, 12:00'); // Adjust for locale-specific output
    });

    it('should handle invalid ISO strings gracefully', async () => {
      const invalidIsoString = 'invalid-date';
      const result = await formatedDate(invalidIsoString);
      expect(result).toBe('Invalid Date, NaN:NaN');
    });
  });
});
