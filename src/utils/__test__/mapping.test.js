import { describe, it, expect} from '@jest/globals';
import { getTotalPriceForEachPassengerInSegments, getTotalPriceForEachPassengerInSegment } from '../mapping.js';

describe('getTotalPriceForEachPassengerInSegments', () => {
    it('should calculate total price for each passenger in segments', () => {
        const bookings = [
            {
                segments: [
                    { passengerId: 1, flight: { price: 100 } },
                    { passengerId: 1, flight: { price: 200 } },
                    { passengerId: 2, flight: { price: 150 } }
                ],
                passengerCount: { adult: 2, child: 1 }
            }
        ];

        const result = getTotalPriceForEachPassengerInSegments(bookings);

        expect(result).toEqual([
            {
                segments: [
                    { passengerId: 1, flight: { price: 100 } },
                    { passengerId: 1, flight: { price: 200 } },
                    { passengerId: 2, flight: { price: 150 } }
                ],
                passengerCount: { adult: 2, child: 1 },
                adultTotalPrice: 600,
                childTotalPrice: 300
            }
        ]);
    });
});

describe('getTotalPriceForEachPassengerInSegment', () => {
    it('should calculate total price for each passenger in a single segment', () => {
        const booking = {
            segments: [
                { passengerId: 1, flight: { price: 100 } },
                { passengerId: 1, flight: { price: 200 } },
                { passengerId: 2, flight: { price: 150 } }
            ],
            passengerCount: { adult: 2, child: 1 }
        };

        const result = getTotalPriceForEachPassengerInSegment(booking);

        expect(result).toEqual({
            segments: [
                { passengerId: 1, flight: { price: 100 } },
                { passengerId: 1, flight: { price: 200 } },
                { passengerId: 2, flight: { price: 150 } }
            ],
            passengerCount: { adult: 2, child: 1 },
            adultTotalPrice: 600,
            childTotalPrice: 300
        });
    });
});