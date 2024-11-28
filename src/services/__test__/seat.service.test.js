import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import * as SeatService from '../../services/seat.service.js';
import prisma from '../../configs/database.js'; 
import { Error404 } from '../../utils/customError.js';

jest.mock('../../configs/database.js', () => ({
  __esModule: true, 
  default: {
    flightSeats: {
      findMany: jest.fn(),
    },
  },
}));

describe('Seat Service', () => {
  let flightId;

  beforeEach(() => {
    flightId = 123;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSeatsByFlightID', () => {
    it('should return an array of seats when seats are available', async () => {
      const mockSeats = [
        { id: 1, position: 'A1', isAvailable: true },
        { id: 2, position: 'A2', isAvailable: false },
      ];
      prisma.flightSeats.findMany.mockResolvedValue(mockSeats);

      const seats = await SeatService.getSeatsByFlightID(flightId);

      expect(prisma.flightSeats.findMany).toHaveBeenCalledWith({
        where: { flightId: 123 },
        select: {
          id: true,
          position: true,
          isAvailable: true,
        },
      });
      expect(seats).toEqual(mockSeats);
    });

    it('should throw an Error404 if no seats are available for the flight', async () => {
      prisma.flightSeats.findMany.mockResolvedValue([]);

      try {
        await SeatService.getSeatsByFlightID(flightId);
      } catch (error) {
        expect(error).toBeInstanceOf(Error404);
        expect(error.message).toBe('Terjadi Kesalahan, Mohon Maaf saat ini tidak tersedia kursi untuk Nomor penerbangan ini.');
      }
    });

    it('should throw an error if there is an issue querying the database', async () => {
      prisma.flightSeats.findMany.mockRejectedValue(new Error('Database error'));
      try {
        await SeatService.getSeatsByFlightID(flightId);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Database error');
      }
    });
  });
});
