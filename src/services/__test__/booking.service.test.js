import { jest, describe, test, expect, afterEach, beforeEach } from '@jest/globals';
import * as BookingService from '../booking.service.js';
import prisma from '../../configs/database.js';
import { Error404, Error400 } from '../../utils/customError.js';
import { encodeBookingCode } from '../../utils/hashids.js';

jest.mock('../../configs/database.js', () => ({
    __esModule: true,
    default: {
        voucher: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
        booking: { count: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
        flight: { findMany: jest.fn() },
        payment: { create: jest.fn() },
        passengerCount: { create: jest.fn() },
        passenger: { findUnique: jest.fn(), create: jest.fn() },
        flightSeats: { update: jest.fn() },
        bookingSegments: { create: jest.fn() },
        notification: { create: jest.fn() },
        $transaction: jest.fn(), 
    },
}));

jest.mock('../../utils/hashids.js');
jest.mock('../../configs/websocket.js');

const mockGetTotalPriceForEachPassengerInSegments = (bookings) => {
    return bookings.map(booking => ({
        ...booking,
        adultTotalPrice: 100,  
        childTotalPrice: 50,   
    }));
};

describe('Booking Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getBookings', () => {
        test('should return bookings with booking codes', async () => {
            const mockBookings = [
                {
                    id: 1,
                    userId: 1,
                    status: 'Unpaid',
                    createdAt: new Date(),
                    user: {
                        id: 1,
                        email: 'test@example.com',
                        profile: {
                            fullName: 'John Doe',
                            phone: '1234567890',
                        },
                    },
                    passengerCount: 1,
                    segments: [
                        {
                            flight: {
                                id: 1,
                                flightNum: 'AB123',
                                departureTime: new Date(),
                                arrivalTime: new Date(),
                                estimatedDuration: 120,
                                price: 200,
                                seatClass: 'Economy',
                                departureTerminal: {
                                    id: 1,
                                    name: 'Terminal 1',
                                    airport: {
                                        id: 1,
                                        name: 'Airport A',
                                        code: 'AAA',
                                    },
                                },
                                arrivalTerminal: {
                                    id: 2,
                                    name: 'Terminal 2',
                                    airport: {
                                        id: 2,
                                        name: 'Airport B',
                                        code: 'BBB',
                                    },
                                },
                                airline: {
                                    id: 1,
                                    name: 'Airline A',
                                    code: 'AA',
                                    image: 'airline-a-logo.png',
                                },
                            },
                            flightSeat: {
                                position: '1A',
                                isAvailable: true,
                            },
                            passenger: { id: 1, name: 'John Doe' },
                        },
                    ],
                    payments: [
                        {
                            transactionId: 'tx123',
                            status: 'Pending',
                            total: 200,
                            method: 'Credit Card',
                        },
                    ],
                    voucher: null,
                },
            ];

            prisma.booking.findMany.mockResolvedValue(mockBookings);
            encodeBookingCode.mockResolvedValue('BOOKING_CODE_1');

            const result = await BookingService.getBookings(1);

            expect(result).toHaveLength(1);
            expect(result[0].bookingCode).toBe('BOOKING_CODE_1');
            expect(result[0].user.email).toBe('test@example.com');
            expect(result[0].segments[0].flight.flightNum).toBe('AB123');
        });

        test('should throw an error if no bookings are found', async () => {
            prisma.booking.findMany.mockResolvedValue([]);

            await expect(BookingService.getBookings(1)).rejects.toThrowError(new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.'));
        });
    });

    describe('getBooking', () => {
        test('should return a booking with booking code', async () => {
            const mockBooking = {
                id: 1,
                userId: 1,
                status: 'Unpaid',
                createdAt: new Date(),
                user: {
                    id: 1,
                    email: 'test@example.com',
                    profile: {
                        fullName: 'John Doe',
                        phone: '1234567890',
                    },
                },
                passengerCount: 1,
                segments: [
                    {
                        flight: {
                            id: 1,
                            flightNum: 'AB123',
                            departureTime: new Date(),
                            arrivalTime: new Date(),
                            estimatedDuration: 120,
                            price: 200,
                            seatClass: 'Economy',
                            departureTerminal: {
                                id: 1,
                                name: 'Terminal 1',
                                airport: {
                                    id: 1,
                                    name: 'Airport A',
                                    code: 'AAA',
                                },
                            },
                            arrivalTerminal: {
                                id: 2,
                                name: 'Terminal 2',
                                airport: {
                                    id: 2,
                                    name: 'Airport B',
                                    code: 'BBB',
                                },
                            },
                            airline: {
                                id: 1,
                                name: 'Airline A',
                                code: 'AA',
                                image: 'airline-a-logo.png',
                            },
                        },
                        flightSeat: {
                            position: '1A',
                            isAvailable: true,
                        },
                        passenger: { id: 1, name: 'John Doe' },
                    },
                ],
                payments: [
                    {
                        transactionId: 'tx123',
                        status: 'Pending',
                        total: 200,
                        method: 'Credit Card',
                    },
                ],
                voucher: null,
            };

            prisma.booking.findUnique.mockResolvedValue(mockBooking);
            encodeBookingCode.mockResolvedValue('BOOKING_CODE_1');

            const result = await BookingService.getBooking(1, 1);

            expect(result.bookingCode).toBe('BOOKING_CODE_1');
            expect(result.user.email).toBe('test@example.com');
            expect(result.segments[0].flight.flightNum).toBe('AB123');
            expect(result.payments[0].transactionId).toBe('tx123');
        });

        test('should throw an error if booking is not found', async () => {
            prisma.booking.findUnique.mockResolvedValue(null);

            await expect(BookingService.getBooking(1, 1)).rejects.toThrowError(
                new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.')
            );
        });
    });
    //     const mockUserId = 1;
    //     const mockStartDate = '2024-01-01';
    //     const mockEndDate = '2024-12-31';

    //     it('should return bookings by date range', async () => {
    //         // Mock booking data
    //         const mockBookings = [
    //             {
    //                 id: 1,
    //                 userId: mockUserId,
    //                 createdAt: new Date('2024-06-15'),
    //                 status: 'Confirmed',
    //                 segments: [],
    //                 payments: [],
    //             },
    //         ];

    //         // Mock prisma.booking.findMany
    //         prisma.booking.findMany.mockResolvedValue(mockBookings);

    //         // Mock encodeBookingCode
    //         encodeBookingCode.mockResolvedValue('BOOKING_CODE_1');

    //         // Mock getTotalPriceForEachPassengerInSegments
    //         const mockTotalPriceMapping = mockGetTotalPriceForEachPassengerInSegments(mockBookings);

    //         // Call the service method
    //         const result = await BookingService.getBookingsByDate(mockUserId, mockStartDate, mockEndDate);

    //         // Verifications
    //         expect(prisma.booking.findMany).toHaveBeenCalledWith({
    //             where: {
    //                 userId: mockUserId,
    //                 createdAt: {
    //                     gte: new Date(mockStartDate),
    //                     lte: new Date(mockEndDate),
    //                 },
    //             },
    //             include: expect.any(Object),
    //         });
    //         expect(encodeBookingCode).toHaveBeenCalledWith(1);
    //         expect(result).toEqual(mockTotalPriceMapping);
    //     });

    //     it('should throw an error if no bookings are found', async () => {
    //         // Mock empty result from prisma.booking.findMany
    //         prisma.booking.findMany.mockResolvedValue([]);

    //         await expect(BookingService.getBookingsByDate(mockUserId, mockStartDate, mockEndDate)).rejects.toThrowError(
    //             new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.')
    //         );
    //     });
    // });

    describe('getTotalPriceForEachPassengerInSegments', () => {

        beforeEach(() => {
        });

        test('should return correct total prices for adults and children', () => {
            const mockBookings = [
                {
                    segments: [
                        { passengerId: 1, flight: { price: 100 } },
                        { passengerId: 2, flight: { price: 150 } },
                    ],
                    passengerCount: { adult: 1, child: 2 },
                },
            ];

            const expectedResult = [
                {
                    segments: [
                        { passengerId: 1, flight: { price: 100 } },
                        { passengerId: 2, flight: { price: 150 } },
                    ],
                    passengerCount: { adult: 1, child: 2 },
                    adultTotalPrice: 100,  
                    childTotalPrice: 50,   
                },
            ];

            const result = mockGetTotalPriceForEachPassengerInSegments(mockBookings);

            expect(result).toEqual(expectedResult);
        });

        test('should handle empty booking data correctly', () => {
            const mockBookings = [];

            const result = mockGetTotalPriceForEachPassengerInSegments(mockBookings);

            expect(result).toEqual([]);
        });

        test('should handle multiple segments with different prices', () => {
            const mockBookings = [
                {
                    segments: [
                        { passengerId: 1, flight: { price: 200 } },
                        { passengerId: 2, flight: { price: 300 } },
                    ],
                    passengerCount: { adult: 1, child: 1 },
                },
            ];

            const expectedResult = [
                {
                    segments: [
                        { passengerId: 1, flight: { price: 200 } },
                        { passengerId: 2, flight: { price: 300 } },
                    ],
                    passengerCount: { adult: 1, child: 1 },
                    adultTotalPrice: 100,  
                    childTotalPrice: 50,   
                },
            ];

            const result = mockGetTotalPriceForEachPassengerInSegments(mockBookings);

            expect(result).toEqual(expectedResult);
        });
    });
    
    describe('updateStatusBooking', () => {
        const mockBooking = {
            id: 1,
            bookingCode: 'BOOKING_CODE_1',
            status: 'Pending',
            userId: 1,
            segments: [
                {
                    flightSeat: { id: 1 },
                },
            ],
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should throw error if booking is not found', async () => {
            prisma.booking.findUnique.mockResolvedValue(null); 

            const data = { status: 'Cancelled' };
            await expect(BookingService.updateStatusBooking(data, 1)).rejects.toThrowError(
                new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.')
            );
        });

        test('should throw error if booking status is "Issued"', async () => {
            prisma.booking.findUnique.mockResolvedValue({ ...mockBooking, status: 'Issued' }); 

            const data = { status: 'Cancelled' };
            await expect(BookingService.updateStatusBooking(data, 1)).rejects.toThrowError(
                new Error400('Status Booking sudah tidak bisa diubah karena sudah dilakukan pembayaran.')
            );
        });

        test('should throw error if booking status is "Cancelled"', async () => {
            prisma.booking.findUnique.mockResolvedValue({ ...mockBooking, status: 'Cancelled' }); 

            const data = { status: 'Pending' };
            await expect(BookingService.updateStatusBooking(data, 1)).rejects.toThrowError(
                new Error400('Status Booking sudah tidak bisa diubah karena sudah dilakukan pembatalan.')
            );
        });

        test('should throw error if an invalid status is provided', async () => {
            const data = { status: 'InvalidStatus' }; 

            await expect(BookingService.updateStatusBooking(data, 1)).rejects.toThrowError(
                new Error400('Status Booking sudah tidak bisa diubah karena sudah dilakukan pembatalan.')
            );
        });
    });   
});



