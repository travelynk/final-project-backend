import * as VoucherController from '../../../controllers/voucher.controller.js';
import { isAdmin } from '../../../middlewares/auth.js';

export default (router) => {
    const prefix = '/vouchers';

    router.get(prefix + '/', VoucherController.getVouchers);
    router.get(prefix + '/:id', VoucherController.getVoucherById);
    router.post(prefix + '/:code', VoucherController.getVoucherByCode);
    router.post(prefix + '/', isAdmin, VoucherController.storeVoucher);
    router.put(prefix + '/:code',isAdmin, VoucherController.updateVoucher);
};