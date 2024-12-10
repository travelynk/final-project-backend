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
  booking: { findUnique: jest.fn(), update: jest.fn() },
  payment: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
}));

jest.mock("../../configs/midtransClient.js", () => ({
  coreApi: { charge: jest.fn(), cardToken: jest.fn() },
  snap: {
    transaction: { status: jest.fn(), cancel: jest.fn() },
  },
}));

jest.mock("../../utils/qrcode.js", () => ({
  generateQrPng: jest.fn().mockResolvedValue(Buffer.from("mockQRCode")),
}));

jest.mock("../../utils/imagekit.js", () => ({
  imagekit: {
    upload: jest.fn().mockResolvedValue({
      url: "https://mock-imagekit.io/path/to/image",
      fileName: "mocked-image.png",
    }),
  },
}));

jest.mock("../../utils/hashids.js", () => ({
  encodeBookingCode: jest.fn().mockResolvedValue("mockEncodedCode"),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mockToken"),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({}),
  }),
}));


afterEach(() => jest.clearAllMocks());

describe("Payment Service Tests", () => {
  describe("createDebitPayment", () => {
    it("should throw error if booking not found", async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(createDebitPayment(1, "bca")).rejects.toThrow("Pemesanan tidak ditemukan");
    });

it("should create debit payment successfully", async () => {
  const mockBooking = {
    id: 1,
    totalPrice: 700000,
    user: { email: "test@example.com", profile: { fullName: "Test User" } },
  };

  const mockUpdatedBooking = {
    ...mockBooking,
    status: "Pending",
    urlQrcode: "https://example.com/qrcode.png",
  };

  const mockChargeResponse = {
    transaction_id: "txn_789",
    order_id: "order_789",
    gross_amount: "700000",
    va_numbers: [],  // Simulasi jika tidak ada VA Number
  };
  
  prisma.booking.findUnique.mockResolvedValue(mockBooking);
  prisma.booking.update.mockResolvedValue(mockUpdatedBooking);
  coreApi.charge.mockResolvedValue(mockChargeResponse);

  prisma.payment.create.mockResolvedValue();

  const response = await createDebitPayment(1, "BNI");

  expect(prisma.booking.findUnique).toHaveBeenCalledWith({
    where: { id: 1 },
    include: { payments: true, user: { include: { profile: true } } },
  });

  expect(prisma.booking.update).toHaveBeenCalledWith({
    where: { id: 1 },
    data: { "urlQrcode": "https://mock-imagekit.io/path/to/image" },
  });

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
        booking: { user: { email: "test@example.com" } },
      });

      snap.transaction.status.mockResolvedValue({ transaction_status: "pending" });
      snap.transaction.cancel.mockResolvedValue({ status_code: "200" });

      prisma.payment.update.mockResolvedValue();

      const response = await cancelPayment("txn_123");

      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
        include: { booking: { include: { user: true } } },
      });
      expect(snap.transaction.status).toHaveBeenCalledWith("txn_123");
      expect(snap.transaction.cancel).toHaveBeenCalledWith("txn_123");
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
        data: { status: "Cancelled" },
      });

      expect(response).toEqual({ status_code: "200" });
    });

    it("should throw error if payment is not found", async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      await expect(cancelPayment("txn_123")).rejects.toThrow("Pembayaran tidak ditemukan");
    });

    it("should throw error if transaction status is not pending", async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 1,
        transactionId: "txn_123",
        status: "pending",
        booking: { user: { email: "test@example.com" } },
      });
    
      snap.transaction.status.mockResolvedValue({ transaction_status: "settlement" });
    
      await expect(cancelPayment("txn_123")).rejects.toThrow(
        "Transaction cannot be cancelled. Current status: settlement."
      );
    
      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
        include: { booking: { include: { user: true } } },
      });
    
      expect(snap.transaction.status).toHaveBeenCalledWith("txn_123");
    });
  });

  describe("checkPaymentStatus", () => {
    it("should return payment status successfully", async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 1,
        transactionId: "txn_123",
        booking: { user: { email: "test@example.com" } },
      });

      snap.transaction.status.mockResolvedValue({ transaction_status: "settlement" });

      prisma.payment.update.mockResolvedValue();

      const response = await checkPaymentStatus("txn_123");

      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
        include: { booking: { include: { user: true } } },
      });
      expect(snap.transaction.status).toHaveBeenCalledWith("txn_123");
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
        data: { status: "Settlement" },
      });

      expect(response).toEqual({ transaction_status: "settlement" });
    });

    it("should throw error if payment is not found", async () => {
      prisma.payment.findUnique.mockResolvedValue(null);
      await expect(checkPaymentStatus("txn_123")).rejects.toThrow("Pembayaran tidak ditemukan");
    });
  });

  describe("createGoPayPayment", () => {
    it("should throw error if booking is not found", async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(createGoPayPayment(1)).rejects.toThrow("Pemesanan tidak ditemukan");
    });

    it("should create GoPay payment successfully", async () => {
      const mockBooking = {
        id: 1,
        totalPrice: 300000,
        user: { email: "test@example.com", profile: { fullName: "Test User" } },
      };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const mockChargeResponse = {
        transaction_id: "txn_456",
        order_id: "order_456",
        gross_amount: "300000",
        actions: [{ name: "deeplink-redirect", url: "https://gopay.mock.url" }],
        transaction_time: "2024-12-10T12:00:00Z",
      };
      coreApi.charge.mockResolvedValue(mockChargeResponse);

      prisma.payment.create.mockResolvedValue();

      const response = await createGoPayPayment(1);

      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { payments: true, user: { include: { profile: true } } },
      });
      expect(coreApi.charge).toHaveBeenCalled();
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(response).toEqual(mockChargeResponse);
    });
  });

  describe("createCardPayment", () => {
    it("should throw error if booking is not found", async () => {
      prisma.booking.findUnique.mockResolvedValue(null);
      await expect(createCardPayment(1, "mockCardToken")).rejects.toThrow("Pemesanan tidak ditemukan");
    });

    it("should create Card payment successfully", async () => {
      const mockBooking = {
        id: 1,
        totalPrice: 700000,
        user: { email: "test@example.com", profile: { fullName: "Test User" } },
      };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const mockChargeResponse = {
        transaction_id: "txn_789",
        order_id: "order_789",
        gross_amount: "700000",
      };
      coreApi.charge.mockResolvedValue(mockChargeResponse);

      prisma.payment.create.mockResolvedValue();

      const response = await createCardPayment(1, "mockCardToken");

      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { payments: true, user: { include: { profile: true } } },
      });
      expect(coreApi.charge).toHaveBeenCalled();
      expect(prisma.payment.create).toHaveBeenCalled();
      expect(response).toEqual(mockChargeResponse);
    });
  });
});
