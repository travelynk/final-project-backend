
import * as paymentController from '../../../controllers/paymentV2.controller.js';

export default (router) => {
    const prefix = '/payments';

    router.post(prefix + '/create', paymentController.createPayment);
    router.delete(prefix + '/:transactionId', paymentController.cancelPayment);
    router.get(prefix + '/:transactionId', paymentController.checkPaymentStatus);

};
