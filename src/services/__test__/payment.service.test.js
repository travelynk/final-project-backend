import { jest, describe, it, expect, afterEach } from "@jest/globals";
import prisma from "../../configs/database.js";
import { coreApi, snap } from "../../configs/midtransClient.js";
import {
  createDebitPayment,
  cancelPayment,
  checkPaymentStatus,
  createGoPayPayment,
  createCardPayment,
} from "../payment.service.js";

// Mock dependencies
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
      const mockBooking = {
        id: 1,
        totalPrice: 500000,
        user: { email: "test@example.com", profile: { fullName: "Test User" } },
      };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const mockChargeResponse = {
        transaction_id: "txn_123",
        order_id: "order_123",
        gross_amount: "500000",
      };
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
      prisma.payment.findUnique.mockResolvedValue({
        id: 1,
        transactionId: "txn_123",
        status: "pending",
      });

      snap.transaction.status.mockResolvedValue({ transaction_status: "pending" });
      snap.transaction.cancel.mockResolvedValue({ status_code: "200" });

      prisma.payment.update.mockResolvedValue({ id: 1, status: "Cancelled" });

      const response = await cancelPayment("txn_123");

      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
      });
      expect(snap.transaction.status).toHaveBeenCalledWith("txn_123");
      expect(snap.transaction.cancel).toHaveBeenCalledWith("txn_123");
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
        data: { status: "Cancelled" },
      });

      expect(response).toEqual({ status_code: "200" });
    });
    
    it("should throw error if transaction is not pending", async () => {
      snap.transaction.status.mockResolvedValue({ transaction_status: "settlement" });
      await expect(cancelPayment("txn_123")).rejects.toThrow("Transaction cannot be cancelled. Current status: settlement.");
    });
    
  });

  describe("checkPaymentStatus", () => {
    it("should return payment status successfully", async () => {
      snap.transaction.status.mockResolvedValue({ transaction_status: "settlement" });

      const response = await checkPaymentStatus("txn_123");

      expect(snap.transaction.status).toHaveBeenCalledWith("txn_123");
      expect(response).toEqual({ transaction_status: "settlement" });
    });
    
    it("should throw error if transaction not found", async () => {
      snap.transaction.status.mockResolvedValue(null);
      await expect(checkPaymentStatus("txn_123")).rejects.toThrow("Cannot read properties of null (reading 'transaction_status')");
    });
  });

  describe("createGoPayPayment", () => {
    it("should create GoPay payment successfully", async () => {
      const mockBooking = {
        id: 1,
        totalPrice: 300000,
        user: { email: "test@example.com", profile: { fullName: "Test User" } },
      };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const mockResponse = {
        transaction_id: "txn_456",
        order_id: "order_456",
        gross_amount: "300000",
      };
      coreApi.charge.mockResolvedValue(mockResponse);
      prisma.payment.create.mockResolvedValue();

      const response = await createGoPayPayment(1);

      expect(prisma.booking.findUnique).toHaveBeenCalled();
      expect(coreApi.charge).toHaveBeenCalled();
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(response).toEqual(mockResponse);
    });
    
    it("should throw error if booking not found", async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(createGoPayPayment(1)).rejects.toThrow("Booking not found");
    });
    
  });

  describe("createCardPayment", () => {
    it("should throw error if booking not found", async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(createCardPayment(1, "card_token_123")).rejects.toThrow("Booking not found");
    });
    
    it("should create Card payment successfully", async () => {
      const mockBooking = {
        id: 1,
        totalPrice: 700000,
        user: { email: "test@example.com", profile: { fullName: "Test User" } },
      };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const mockResponse = {
        transaction_id: "txn_789",
        order_id: "order_789",
        gross_amount: "700000",
      };
      coreApi.charge.mockResolvedValue(mockResponse);

      prisma.payment.create.mockResolvedValue();

      const response = await createCardPayment(1, "4111111111111111", "123");
      expect(prisma.booking.findUnique).toHaveBeenCalled();
      expect(coreApi.charge).toHaveBeenCalled();
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(response).toEqual(mockResponse);
    });
  });
});
