import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { createDebitPayment, cancelPayment, checkPaymentStatus, createGoPayPayment, createCreditCardPayment } from '../../controllers/payment.controller.js';
import * as paymentService from '../../services/payment.service.js';
import * as PaymentValidation from '../../validations/payment.validation.js';
import * as response from '../../utils/response.js';
import { Error400, Error404 } from '../../utils/customError.js';

jest.mock('../../services/payment.service.js');
jest.mock('../../utils/response.js');

describe('Payment Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createDebitPayment', () => {
        it('should return 400 on validation error', async () => {
            jest.spyOn(PaymentValidation.createPaymentSchema, 'validate').mockReturnValue({
                error: { details: [{ message: 'Validation error' }] },
            });

            await createDebitPayment(req, res, next);
            expect(next).toHaveBeenCalledWith(new Error400('Validation error'));
        });

        it('should return 200 on successful debit payment creation', async () => {
            req.body = { bookingId: '123', bank: 'mockBank' };
            jest.spyOn(PaymentValidation.createPaymentSchema, 'validate').mockReturnValue({ error: null, value: req.body });

            paymentService.createDebitPayment.mockResolvedValue({
                message: 'Pembayaran berhasil dibuat',
                url: 'mockUrl',
            });

            await createDebitPayment(req, res, next);

            expect(response.res200).toHaveBeenCalledWith(
                'Pembayaran berhasil dibuat',
                { paymentUrl: { message: 'Pembayaran berhasil dibuat', url: 'mockUrl' } },
                res
            );
        });
    });

    describe('cancelPayment', () => {
        it('should return 404 if payment is not found', async () => {
            req.params = { transactionId: '123' };
            jest.spyOn(PaymentValidation.cancelPaymentSchema, 'validate').mockReturnValue({ error: null, value: req.params });

            paymentService.cancelPayment.mockResolvedValue(null);

            await cancelPayment(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404('Pembayaran tidak ditemukan'));
        });

        it('should return 200 on successful payment cancellation', async () => {
            req.params = { transactionId: '123' };
            jest.spyOn(PaymentValidation.cancelPaymentSchema, 'validate').mockReturnValue({ error: null, value: req.params });

            paymentService.cancelPayment.mockResolvedValue('Cancellation successful');

            await cancelPayment(req, res, next);

            expect(response.res200).toHaveBeenCalledWith(
                'Berhasil membatalkan pembayaran',
                'Cancellation successful',
                res
            );
        });
    });

    describe('checkPaymentStatus', () => {
        it('should return 404 if status not found', async () => {
            req.params = { transactionId: '123' };
            jest.spyOn(PaymentValidation.checkPaymentStatusSchema, 'validate').mockReturnValue({ error: null, value: req.params });

            paymentService.checkPaymentStatus.mockResolvedValue(null);

            await checkPaymentStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404('Status pembayaran tidak ditemukan'));
        });

        it('should return 200 on successful status check', async () => {
            req.params = { transactionId: '123' };
            jest.spyOn(PaymentValidation.checkPaymentStatusSchema, 'validate').mockReturnValue({ error: null, value: req.params });

            paymentService.checkPaymentStatus.mockResolvedValue({ status: 'Paid' });

            await checkPaymentStatus(req, res, next);

            expect(response.res200).toHaveBeenCalledWith(
                'Berhasil mengambil status pembayaran',
                { status: 'Paid' },
                res
            );
        });
    });

    describe('createGoPayPayment', () => {
        it('should return 400 on validation error', async () => {
            jest.spyOn(PaymentValidation.createGoPayPaymentSchema, 'validate').mockReturnValue({
                error: { details: [{ message: 'Validation error' }] },
            });

            await createGoPayPayment(req, res, next);
            expect(next).toHaveBeenCalledWith(new Error400('Validation error'));
        });

        it('should return 200 on successful GoPay payment creation', async () => {
            req.body = { bookingId: '123' };
            jest.spyOn(PaymentValidation.createGoPayPaymentSchema, 'validate').mockReturnValue({ error: null, value: req.body });

            paymentService.createGoPayPayment.mockResolvedValue({
                message: 'Pembayaran berhasil dibuat',
                url: 'mockUrl',
            });

            await createGoPayPayment(req, res, next);

            expect(response.res200).toHaveBeenCalledWith(
                'Pembayaran berhasil dibuat',
                { paymentUrl: { message: 'Pembayaran berhasil dibuat', url: 'mockUrl' } },
                res
            );
        });
    });

    describe('createCreditCardPayment', () => {
        it('should return 400 on validation error', async () => {
            jest.spyOn(PaymentValidation.createCreditCardPaymentSchema, 'validate').mockReturnValue({
                error: { details: [{ message: 'Validation error' }] },
            });

            await createCreditCardPayment(req, res, next);
            expect(next).toHaveBeenCalledWith(new Error400('Validation error'));
        });

        it('should return 201 on successful credit card payment creation', async () => {
            req.body = {
                bookingId: '123',
                card_number: '4111111111111111',
                card_exp_month: '12',
                card_exp_year: '2025',
                card_cvv: '123',
            };

            jest.spyOn(PaymentValidation.createCreditCardPaymentSchema, 'validate').mockReturnValue({
                error: null,
                value: req.body,
            });

            paymentService.createCardToken.mockResolvedValue('mockToken');
            paymentService.createCardPayment.mockResolvedValue({
                paymentId: 'mockPaymentId',
                status: 'Paid',
            });

            await createCreditCardPayment(req, res, next);

           
            expect(response.res200).toHaveBeenCalledWith(
                'Pembayaran berhasil dibuat',
                {
                    paymentId: 'mockPaymentId',
                    status: 'Paid',
                },
                res
            );
        });
    });
});
