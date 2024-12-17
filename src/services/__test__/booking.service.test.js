// import { jest, describe, test, expect, afterEach, beforeEach } from '@jest/globals';
// import * as BookingService from '../booking.service.js';
// import prisma from '../../configs/database.js';
// import { Error404, Error400 } from '../../utils/customError.js';
// import { encodeBookingCode } from '../../utils/hashids.js';
// import { getIoInstance } from '../../configs/websocket.js';

// // Mocks
// jest.mock('../../configs/database.js', () => ({
//   __esModule: true,
//   default: {
//     voucher: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
//     booking: { count: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
//     flight: { findMany: jest.fn() },
//     payment: { create: jest.fn() },
//     passengerCount: { create: jest.fn() },
//     passenger: { findUnique: jest.fn(), create: jest.fn() },
//     flightSeats: { update: jest.fn() },
//     bookingSegments: { create: jest.fn() },
//     notification: { create: jest.fn() },
//     $transaction: jest.fn(), // Mocking $transaction here
//   },
// }));

// jest.mock('../../utils/hashids.js');
// jest.mock('../../configs/websocket.js');

// describe('Booking Service', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('updateStatusBooking', () => {
//     const mockBooking = {
//       id: 1,
//       bookingCode: 'BOOKING_CODE_1',
//       status: 'Pending',
//       userId: 1,
//       segments: [
//         {
//           flightSeat: { id: 1 },
//         },
//       ],
//     };

//     beforeEach(() => {
//       jest.clearAllMocks();
//     });

//     test('should throw error if booking is not found', async () => {
//       prisma.booking.findUnique.mockResolvedValue(null); // Simulate booking not found

//       const data = { status: 'Cancelled' };
//       await expect(BookingService.updateStatusBooking(data, 1)).rejects.toThrowError(
//         new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.')
//       );
//     });

//     test('should throw error if booking status is "Issued"', async () => {
//       prisma.booking.findUnique.mockResolvedValue({ ...mockBooking, status: 'Issued' }); // Booking status "Issued"

//       const data = { status: 'Cancelled' };
//       await expect(BookingService.updateStatusBooking(data, 1)).rejects.toThrowError(
//         new Error400('Status Booking sudah tidak bisa diubah karena sudah dilakukan pembayaran.')
//       );
//     });

//     test('should throw error if booking status is "Cancelled"', async () => {
//       prisma.booking.findUnique.mockResolvedValue({ ...mockBooking, status: 'Cancelled' }); // Booking status "Cancelled"

//       const data = { status: 'Pending' };
//       await expect(BookingService.updateStatusBooking(data, 1)).rejects.toThrowError(
//         new Error400('Status Booking sudah tidak bisa diubah karena sudah dilakukan pembatalan.')
//       );
//     });

//     test('should successfully update booking status to "Cancelled"', async () => {
//       const mockUpdatedBooking = {
//         id: 1,
//         bookingCode: 'BOOKING_CODE_1',
//         status: 'Cancelled',
//         userId: 1,
//         segments: [
//           {
//             flightSeat: { id: 1 },
//           },
//         ],
//       };

//       prisma.booking.findUnique.mockResolvedValue(mockBooking); // Mock the booking being found

//       // Mock the transaction
//       prisma.$transaction.mockImplementation(async (callback) => {
//         const tx = {
//           flightSeats: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
//           booking: { update: jest.fn().mockResolvedValue(mockUpdatedBooking) },
//         };
//         await callback(tx); // Call the transaction callback
//       });

//       encodeBookingCode.mockResolvedValue('BOOKING_CODE_1'); // Mock encodeBookingCode
//       getIoInstance.mockReturnValue({ emit: jest.fn() }); // Mock WebSocket emit

//       const data = { status: 'Cancelled' };
//       const result = await BookingService.updateStatusBooking(data, 1);

//       // Ensure update is being called
//       expect(prisma.booking.update).toHaveBeenCalledWith({
//         where: { id: 1 },
//         data: { status: 'Cancelled' },
//       });

//       expect(result.status).toBe('Cancelled');
//       expect(prisma.flightSeats.updateMany).toHaveBeenCalledWith({
//         where: { id: [1] },
//         data: { isAvailable: true },
//       });
//       expect(encodeBookingCode).toHaveBeenCalledWith(mockUpdatedBooking.id);
//       expect(getIoInstance().emit).toHaveBeenCalled();
//       expect(prisma.notification.create).toHaveBeenCalled();
//     });

//     test('should successfully update booking status to another value', async () => {
//       const mockUpdatedBooking = { ...mockBooking, status: 'Confirmed' };
//       prisma.booking.findUnique.mockResolvedValue(mockBooking); // Mock the booking being found

//       // Mock the transaction
//       prisma.$transaction.mockImplementation(async (callback) => {
//         const tx = {
//           flightSeats: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
//           booking: { update: jest.fn().mockResolvedValue(mockUpdatedBooking) },
//         };
//         await callback(tx); // Call the transaction callback
//       });

//       encodeBookingCode.mockResolvedValue('BOOKING_CODE_1'); // Mock encodeBookingCode

//       const data = { status: 'Confirmed' };
//       const result = await BookingService.updateStatusBooking(data, 1);

//       // Ensure update is being called
//       expect(prisma.booking.update).toHaveBeenCalledWith({
//         where: { id: 1 },
//         data: { status: 'Confirmed' },
//       });

//       expect(result.status).toBe('Confirmed');
//     });
//   });
// });
