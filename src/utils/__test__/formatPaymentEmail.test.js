import { describe, test, expect } from '@jest/globals';
const { vaNumberPaymentEmail, gopayPaymentEmail, cardPaymentEmail, cancelPaymentEmail, paymentStatusEmail } = require('../formatPaymentEmail');

describe('formatPaymentEmail', () => {
    test('vaNumberPaymentEmail generates correct HTML', () => {
        const bank = 'BCA';
        const totalPrice = 1000000;
        const orderId = '123456';
        const virtualAccount = '9876543210';
        const expiredDate = '2023-12-31';
        const qrCodeUrl = 'http://example.com/qrcode.png';

        const result = vaNumberPaymentEmail(bank, totalPrice, orderId, virtualAccount, expiredDate, qrCodeUrl);

        expect(result).toContain(bank);
        expect(result).toContain(totalPrice.toLocaleString());
        expect(result).toContain(orderId);
        expect(result).toContain(virtualAccount);
        expect(result).toContain(expiredDate);
        expect(result).toContain(qrCodeUrl);
    });

    test('gopayPaymentEmail generates correct HTML', () => {
        const totalPrice = 500000;
        const orderId = '654321';
        const expiredDate = '2023-12-31';
        const gopayDeepLink = 'http://example.com/gopay';
        const gopayQrCodeUrl = 'http://example.com/gopayqrcode.png';
        const infoQrCodeUrl = 'http://example.com/infoqrcode.png';

        const result = gopayPaymentEmail(totalPrice, orderId, expiredDate, gopayDeepLink, gopayQrCodeUrl, infoQrCodeUrl);

        expect(result).toContain(totalPrice.toLocaleString());
        expect(result).toContain(orderId);
        expect(result).toContain(expiredDate);
        expect(result).toContain(gopayDeepLink);
        expect(result).toContain(gopayQrCodeUrl);
        expect(result).toContain(infoQrCodeUrl);
    });

    test('cardPaymentEmail generates correct HTML', () => {
        const totalPrice = 750000;
        const orderId = '789012';
        const transactionStatus = 'capture';
        const qrCodeUrl = 'http://example.com/cardqrcode.png';

        const result = cardPaymentEmail(totalPrice, orderId, transactionStatus, qrCodeUrl);

        expect(result).toContain(totalPrice.toLocaleString());
        expect(result).toContain(orderId);
        expect(result).toContain(transactionStatus === 'capture' ? 'Sukses' : 'Pending');
        expect(result).toContain(qrCodeUrl);
    });

    test('cardPaymentEmail generates correct HTML with different status', () => {
        const totalPrice = 750000;
        const orderId = '789012';
        const transactionStatus = 'pending';
        const qrCodeUrl = 'http://example.com/cardqrcode.png';

        const result = cardPaymentEmail(totalPrice, orderId, transactionStatus, qrCodeUrl);

        expect(result).toContain(totalPrice.toLocaleString());
        expect(result).toContain(orderId);
        expect(result).toContain(transactionStatus === 'capture' ? 'Sukses' : 'Pending');
        expect(result).toContain(qrCodeUrl);
    });

    test('cancelPaymentEmail generates correct HTML', () => {
        const transactionId = '345678';

        const result = cancelPaymentEmail(transactionId);

        expect(result).toContain(transactionId);
        expect(result).toContain('Cancelled');
    });

    test('paymentStatusEmail generates correct HTML', () => {
        const transactionId = '901234';
        const statusFormatted = 'Sukses';

        const result = paymentStatusEmail(transactionId, statusFormatted);

        expect(result).toContain(transactionId);
        expect(result).toContain(statusFormatted);
    });
});