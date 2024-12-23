import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { generateQrCode } from '../generateQrcode.js';
import { encodeBookingCode } from '../hashids.js';
import jwt from 'jsonwebtoken';
import { generateQrPng } from '../qrcode.js';
import { imagekit } from '../imagekit.js';
import prisma from '../../configs/database.js';

jest.mock('../hashids.js');
jest.mock('jsonwebtoken');
jest.mock('../qrcode.js');
jest.mock('imagekit', () => {
    return jest.fn().mockImplementation(() => ({
        upload: jest.fn(() => Promise.resolve({ url: 'https://mocked-url.com/image.jpg' })),
        deleteFile: jest.fn(() => Promise.resolve({}))
    }));
});
jest.mock('../../configs/database.js', () => {
    return {
        booking: {
            update: jest.fn(),
        },
    };
});

describe('generateQrCode', () => {
    const mockId = 1;
    const mockCode = 'encoded-code';
    const mockToken = 'jwt-token';
    const mockQrPng = Buffer.from('mock-qr-code');
    const mockQrCodeUrl = 'https://imagekit.io/mock-url';
    const mockUpdatedBooking = { urlQrcode: mockQrCodeUrl };

    beforeEach(() => {
        jest.clearAllMocks();

        encodeBookingCode.mockResolvedValue(mockCode);
        jwt.sign.mockReturnValue(mockToken);
        generateQrPng.mockResolvedValue(mockQrPng);
        imagekit.upload.mockResolvedValue({ url: mockQrCodeUrl });
        prisma.booking.update.mockResolvedValue(mockUpdatedBooking);

        process.env.JWT_SECRET_FORGET = 'mock-secret';
        process.env.DOMAIN_URL = 'https://example.com';
    });

    it('should generate and upload a QR code, then update the booking with the QR code URL', async () => {
        const result = await generateQrCode(mockId);

        expect(encodeBookingCode).toHaveBeenCalledWith(mockId);
        expect(jwt.sign).toHaveBeenCalledWith({ code: mockCode }, 'mock-secret');
        expect(generateQrPng).toHaveBeenCalledWith('https://example.com/bookings/ticket?token=jwt-token');
        expect(imagekit.upload).toHaveBeenCalledWith({
            fileName: 'testing',
            file: mockQrPng.toString('base64'),
        });
        expect(prisma.booking.update).toHaveBeenCalledWith({
            where: { id: mockId },
            data: { urlQrcode: mockQrCodeUrl },
        });

        expect(result).toBe(mockQrCodeUrl);
    });

    it('should throw an error if any step fails', async () => {
        encodeBookingCode.mockRejectedValue(new Error('Encoding failed'));

        await expect(generateQrCode(mockId)).rejects.toThrow('Encoding failed');

        expect(jwt.sign).not.toHaveBeenCalled();
        expect(generateQrPng).not.toHaveBeenCalled();
        expect(imagekit.upload).not.toHaveBeenCalled();
        expect(prisma.booking.update).not.toHaveBeenCalled();
    });
});