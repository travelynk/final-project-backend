import * as VoucherService from '../services/voucher.service.js';
import * as VoucherValidation from '../validations/voucher.validation.js';
import { res200, res201 } from '../utils/response.js';
import { Error400, Error404 } from '../utils/customError.js';

export const getVouchers = async (req, res, next) => {
    try {
        const vouchers = await VoucherService.getVouchers();

        res200('Berhasil mengambil semua data voucher', vouchers, res);
    } catch (error) {
        next(error);
    }
};

export const storeVoucher = async (req, res, next) => {
    try {
        const { error, value } = VoucherValidation.storeVoucher.validate(req.body);

        if (error) {
            throw new Error400(error.message);
        };

        const voucher = await VoucherService.storeVoucher(value);

        res200('Berhasil', voucher, res);
    } catch (error) {
        next(error);
    }
};

export const getVoucherByCode = async (req, res, next) => {
    try {
        const validationBody = VoucherValidation.getVoucherByCodeBody.validate(req.body);

        const validationParams = VoucherValidation.getVoucherByCodeParams.validate(req.params);

        if (validationBody.error || validationParams.error) {
            const errors = [];
            if (validationParams.error) errors.push(validationParams.error.message);
            if (validationBody.error) errors.push(validationBody.error.message);
            throw new Error400(errors.join(', '));
        };

        const { code } = validationParams.value;
        
        const { totalPrice } = validationBody.value;

        const voucher = await VoucherService.getVoucherByCode(code, totalPrice);

        res200('Berhasil', voucher, res);
    } catch (error) {
        next(error);
    }
};

export const updateVoucher = async (req, res, next) => {
    try {
        const validationBody = VoucherValidation.updateVoucherBody.validate(req.body);

        const validationParams = VoucherValidation.updateVoucherParams.validate(req.params);

        if (validationBody.error || validationParams.error) {
            const errors = [];
            if (validationParams.error) errors.push(validationParams.error.message);
            if (validationBody.error) errors.push(validationBody.error.message);
            throw new Error400(errors.join(', '));
        };

        const { code } = validationParams.value;
        
        const updatedVoucher = await VoucherService.updateVoucher(code, validationBody.value);

        res200('Berhasil', updatedVoucher, res);
    } catch (error) {
        next(error);
    }
};