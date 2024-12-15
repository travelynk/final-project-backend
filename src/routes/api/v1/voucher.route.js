import * as VoucherController from '../../../controllers/voucher.controller.js';

export default (router) => {
    const prefix = '/vouchers';

    router.get(prefix + '/', VoucherController.getVouchers);
    router.get(prefix + '/:id', VoucherController.getVoucherById);
    router.post(prefix + '/:code', VoucherController.getVoucherByCode);
    router.post(prefix + '/', VoucherController.storeVoucher);
    router.put(prefix + '/:code',VoucherController.updateVoucher);
};