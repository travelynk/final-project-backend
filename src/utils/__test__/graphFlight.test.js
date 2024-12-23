import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { MultiGraph } from 'graphology';
import { formatTime } from '../formatTime.js';
import mapFlightData from '../graphFlight.js';

jest.mock('graphology');
jest.mock('../formatTime.js');

describe('graphFlight utils', () => {
    const flights = [
        {
            id: 1,
            flightNum: 'FL123',
            airline: { name: 'Airline1', image: 'image1.png' },
            departureTerminal: { airport: { cityCode: 'JKT', name: 'Soekarno-Hatta', city: { code: 'JKT', name: 'Jakarta' } }, name: 'T1' },
            arrivalTerminal: { airport: { cityCode: 'DPS', name: 'Ngurah Rai', city: { code: 'DPS', name: 'Denpasar' } }, name: 'T2' },
            departureTime: '2023-10-01T08:00:00Z',
            arrivalTime: '2023-10-01T10:00:00Z',
            estimatedDuration: 2,
            facility: 'Economy',
            price: 1000000
        },
        {
            id: 2,
            flightNum: 'FL456',
            airline: { name: 'Airline2', image: 'image2.png' },
            departureTerminal: { airport: { cityCode: 'DPS', name: 'Ngurah Rai', city: { code: 'DPS', name: 'Denpasar' } }, name: 'T2' },
            arrivalTerminal: { airport: { cityCode: 'SUB', name: 'Juanda', city: { code: 'SUB', name: 'Surabaya' } }, name: 'T1' },
            departureTime: '2023-10-01T12:00:00Z',
            arrivalTime: '2023-10-01T14:00:00Z',
            estimatedDuration: 2,
            facility: 'Economy',
            price: 800000
        }
    ];

    const schedule = '2023-10-01T08:00:00Z';
    const seatClass = 'Economy';
    const depCity = 'JKT';
    const arrCity = 'SUB';
    const passengers = [1, 0, 0];

    beforeEach(() => {
        MultiGraph.mockClear();
        formatTime.mockImplementation((time) => ({
            time: new Date(time).toLocaleTimeString(),
            date: new Date(time).toLocaleDateString()
        }));
    });

    it('should find all paths from departure city to arrival city', () => {
        const multiGraph = new MultiGraph();
        jest.spyOn(multiGraph, 'outNeighbors').mockImplementation((node) => {
            if (node === 'JKT') return ['DPS'];
            if (node === 'DPS') return ['SUB'];
            return [];
        });

        const paths = mapFlightData(flights, schedule, seatClass, depCity, arrCity, passengers);

        expect(paths).toHaveLength(1);
        expect(paths[0].flights).toHaveLength(2);
    });

    it('should format flight data correctly', () => {
        const result = mapFlightData(flights, schedule, seatClass, depCity, arrCity, passengers);

        expect(result).toHaveLength(1);
    });
});