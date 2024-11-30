import { createTransaction, getTransactionStatus } from '../services/payment.service.js';

export const getTransactionStatusHandler = async (req, res) => {
    try {
        const { orderId } = req.body;
        console.log(orderId)
        const checkTransactionStatus = await getTransactionStatus(orderId);
        
        if(checkTransactionStatus.transaction_status == "settlement"){
          await prisma.payment.update({
            where: {
              orderId: orderId
            },
            data: {
              status: "settlement"
            }
          })
        }

        res.status(200).json(checkTransactionStatus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const createTransactionHandler = async (req, res) => {
  const { orderId, grossAmount, customerDetails } = req.body;

  const transactionDetails = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: customerDetails,
  };

  try {
    const transaction = await createTransaction(transactionDetails);

    // order id masukan di prisma prisma.create()
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create transaction',
      error: error.message,
    });
  }
};
