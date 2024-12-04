import prisma from "../../configs/database.js";
import { coreApi, snap } from "../../configs/midtransClient.js";
import {
  createDebitPayment,
  cancelPayment,
  checkPaymentStatus,
  createGoPayPayment,
  createCardPayment,
} from "../payment.service.js";

jest.mock("../../configs/database.js", () => ({
  booking: { findUnique: jest.fn() },
  payment: { create: jest.fn(), update: jest.fn() },
}));

jest.mock("../../configs/midtransClient.js", () => ({
  coreApi: { charge: jest.fn() },
  snap: {
    transaction: { status: jest.fn(), cancel: jest.fn() },
  },
}));

describe("Payment Service Tests", () => {
  afterEach(() => jest.clearAllMocks());

  describe("createDebitPayment", () => {
    it("should throw error if booking not found", async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(createDebitPayment(1, "bca")).rejects.toThrow("Booking not found");
    });

    it("should create debit payment successfully", async () => {
      const mockBooking = { id: 1, totalPrice: 500000, user: { email: "test@example.com", profile: { fullName: "Test User" } } };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const mockChargeResponse = { transaction_id: "txn_123", order_id: "order_123", gross_amount: "500000" };
      coreApi.charge.mockResolvedValue(mockChargeResponse);

      prisma.payment.create.mockResolvedValue();

      const response = await createDebitPayment(1, "bca");

      expect(prisma.booking.findUnique).toHaveBeenCalled();
      expect(coreApi.charge).toHaveBeenCalled();
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(response).toEqual(mockChargeResponse);
    });
  });

  describe("cancelPayment", () => {
    it("should throw error if transaction is not pending", async () => {
      snap.transaction.status.mockResolvedValue({ transaction_status: "settlement" });
      await expect(cancelPayment("txn_123")).rejects.toThrow("Transaction cannot be cancelled. Current status: settlement.");
    });

    it("should cancel payment successfully", async () => {
      snap.transaction.status.mockResolvedValue({ transaction_status: "pending" });
      snap.transaction.cancel.mockResolvedValue({ status_code: "200" });
      prisma.payment.update.mockResolvedValue();

      const response = await cancelPayment("txn_123");

      expect(snap.transaction.status).toHaveBeenCalled();
      expect(snap.transaction.cancel).toHaveBeenCalled();
      expect(prisma.payment.update).toHaveBeenCalled();
      expect(response).toEqual({ status_code: "200" });
    });
  });

  describe("checkPaymentStatus", () => {
    it("should throw error if transaction not found", async () => {
      snap.transaction.status.mockResolvedValue(null);
      await expect(checkPaymentStatus("txn_123")).rejects.toThrow("Cannot read properties of null (reading 'transaction_status')");
    });

    it("should update payment status successfully", async () => {
      const mockStatus = { transaction_status: "Settlement" };
      snap.transaction.status.mockResolvedValue(mockStatus);
      prisma.payment.update.mockResolvedValue();

      const response = await checkPaymentStatus("txn_123");

      expect(snap.transaction.status).toHaveBeenCalled();
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
        data: { status: mockStatus.transaction_status },
      });
      expect(response).toEqual(mockStatus);
    });
  });

  describe("createGoPayPayment", () => {
    it("should throw error if booking not found", async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(createGoPayPayment(1)).rejects.toThrow("Booking not found");
    });

    it("should create GoPay payment successfully", async () => {
      const mockBooking = { id: 1, totalPrice: 500000, user: { email: "test@example.com", profile: { fullName: "Test User" } } };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const mockChargeResponse = { transaction_id: "txn_456", order_id: "order_456", gross_amount: "500000", payment_type: "gopay" };
      coreApi.charge.mockResolvedValue(mockChargeResponse);

      prisma.payment.create.mockResolvedValue();

      const response = await createGoPayPayment(1);

      expect(prisma.booking.findUnique).toHaveBeenCalled();
      expect(coreApi.charge).toHaveBeenCalled();
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(response).toEqual(mockChargeResponse);
    });
  });

  describe("createCardPayment", () => {
    it("should throw error if booking not found", async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(createCardPayment(1, "card_token_123")).rejects.toThrow("Booking not found");
    });

    it("should create card payment successfully", async () => {
      const mockBooking = { id: 1, totalPrice: 500000, user: { email: "test@example.com", profile: { fullName: "Test User" } } };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const mockChargeResponse = { transaction_id: "txn_789", order_id: "order_789", gross_amount: "500000", payment_type: "credit_card" };
      coreApi.charge.mockResolvedValue(mockChargeResponse);

      prisma.payment.create.mockResolvedValue();

      const response = await createCardPayment(1, "card_token_123");

      expect(prisma.booking.findUnique).toHaveBeenCalled();
      expect(coreApi.charge).toHaveBeenCalled();
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(response).toEqual(mockChargeResponse);
    });
  });
});
