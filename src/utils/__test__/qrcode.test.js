import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import qr from 'node-qr-image';
import { generateQrPng } from '../qrcode.js';


jest.mock('node-qr-image', () => ({
    imageSync: jest.fn(), // Mock fungsi imageSync sebagai jest.fn()
}));

describe('generateQrPng', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should generate a QR code PNG', async () => {
        // Arrange: Mock the imageSync method to return a fake PNG buffer
        const mockQrCode = Buffer.from('mock-png-data');
        qr.imageSync.mockImplementation(() => mockQrCode);

        const testUrl = 'https://example.com';

        // Act: Call the function with the test URL
        const result = await generateQrPng(testUrl);

        // Assert: Verify the returned value and mock function behavior
        expect(qr.imageSync).toHaveBeenCalledWith(testUrl, {
            type: 'png',
            parse_url: true,
            size: 10,
        });
        expect(result).toBe(mockQrCode);
    });

    it('should throw an error if url is invalid', async () => {
        // Arrange: Mock imageSync to throw an error for invalid URL
        qr.imageSync.mockImplementation(() => {
            throw new Error('Invalid URL');
        });

        const invalidUrl = 'invalid-url';

        // Act & Assert: Ensure the function throws the expected error
        await expect(generateQrPng(invalidUrl)).rejects.toThrow('Invalid URL');

        expect(qr.imageSync).toHaveBeenCalledWith(invalidUrl, {
            type: 'png',
            parse_url: true,
            size: 10,
        });
    });

});