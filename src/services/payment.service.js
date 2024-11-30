import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: false, // Ubah menjadi `true` jika di production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const createTransaction = async (transactionDetails) => {
  try {
    const transaction = await snap.createTransaction(transactionDetails);
    return transaction;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getTransactionStatus = async (transactionId) => {
  try {
    const transactionStatus = await snap.transaction.status(transactionId);
    return transactionStatus;
  } catch (error) {
    throw new Error(error.message);
  }
};