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
  payment: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
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
      await expect(createDebitPayment(1, "bca")).rejects.toThrow("Pemesanan tidak ditemukan");
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
    it("should cancel payment successfully", async () => {
      prisma.payment.findUnique.mockResolvedValue({ id: 1, transactionId: "txn_123", status: "pending" });
    
      snap.transaction.status.mockResolvedValue({ transaction_status: "pending" });
      snap.transaction.cancel.mockResolvedValue({ status_code: "200" });
    
      prisma.payment.update.mockResolvedValue({ id: 1, status: "Cancelled" });
    
      const response = await cancelPayment("txn_123");
    
      expect(prisma.payment.findUnique).toHaveBeenCalledWith({ where: { transactionId: "txn_123" } });
      expect(snap.transaction.status).toHaveBeenCalledWith("txn_123");
      expect(snap.transaction.cancel).toHaveBeenCalledWith("txn_123");
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
        data: { status: "Cancelled" },
      });
      expect(response).toEqual({ status_code: "200" });
    });
  });

  describe("checkPaymentStatus", () => {
    it("should update payment status successfully", async () => {
      prisma.payment.findUnique.mockResolvedValue({ id: 1, transactionId: "txn_123", status: "pending" });
    
      const mockStatus = { transaction_status: "settlement" };
      snap.transaction.status.mockResolvedValue(mockStatus);
    
      prisma.payment.update.mockResolvedValue();
    
      const response = await checkPaymentStatus("txn_123");
    
      expect(prisma.payment.findUnique).toHaveBeenCalledWith({ where: { transactionId: "txn_123" } });
      expect(snap.transaction.status).toHaveBeenCalledWith("txn_123");
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
        data: { status: "Settlement" },
      });
      expect(response).toEqual(mockStatus);
    });
  });

  describe("createGoPayPayment", () => {
    it("should throw error if booking not found", async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(createGoPayPayment(1)).rejects.toThrow("Pemesanan tidak ditemukan");
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
      await expect(createCardPayment(1, "card_token_123")).rejects.toThrow("Pemesanan tidak ditemukan");
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
