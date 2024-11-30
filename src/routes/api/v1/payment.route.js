// import express from 'express';
// import { createTransactionHandler } from '../../../controllers/payment.controller.js';

// const router = express.Router();

// router.post('/createpayment', createTransactionHandler);

// export default router;


//
import * as PayController from '../../../controllers/payment.controller.js';

export default (router) => {
    const prefix = '/pay';
  
    router.post(prefix + '/create', PayController.createTransactionHandler);
    router.get(prefix + '/check', PayController.getTransactionStatusHandler);
  
};