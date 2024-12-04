
import * as paymentController from '../../../controllers/payment.controller.js';

export default (router) => {
    const prefix = '/payments';

    router.post(prefix + '/debit', paymentController.createDebitPayment);
    router.delete(prefix + '/:transactionId', paymentController.cancelPayment);
    router.get(prefix + '/:transactionId', paymentController.checkPaymentStatus);
    router.post(prefix + '/gopay', paymentController.createGoPayPayment);
    router.post(prefix + '/credit-card', paymentController.createCreditCardPayment);

};
