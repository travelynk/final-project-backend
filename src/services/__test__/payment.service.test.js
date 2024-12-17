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
  notification: { create: jest.fn() }, // Tambahkan mock untuk notification
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

jest.mock("../../configs/websocket.js", () => ({
  getIoInstance: jest.fn(() => ({
    emit: jest.fn(),
  })),
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
        va_numbers: [],
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

    it("should handle error if coreApi charge fails", async () => {
      const mockBooking = {
        id: 1,
        totalPrice: 700000,
        user: { email: "test@example.com", profile: { fullName: "Test User" } },
      };

      prisma.booking.findUnique.mockResolvedValue(mockBooking);
      coreApi.charge.mockRejectedValue(new Error("Payment gateway error"));

      await expect(createDebitPayment(1, "BNI")).rejects.toThrow("Payment gateway error");
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

    it("should throw error if cancel fails due to network issue", async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 1,
        transactionId: "txn_123",
        status: "pending",
        booking: { user: { email: "test@example.com" } },
      });

      snap.transaction.status.mockResolvedValue({ transaction_status: "pending" });
      snap.transaction.cancel.mockRejectedValue(new Error("Network issue"));

      await expect(cancelPayment("txn_123")).rejects.toThrow("Network issue");
    });
  });

  describe("checkPaymentStatus", () => {
    it("should update booking status to Issued if payment is settled", async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 1,
        transactionId: "txn_123",
        booking: { id: 1, user: { email: "test@example.com" } },
      });

      snap.transaction.status.mockResolvedValue({ transaction_status: "settlement" });
      prisma.booking.update.mockResolvedValue();
      prisma.payment.update.mockResolvedValue();

      const response = await checkPaymentStatus("txn_123");

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: "Issued" },
      });
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { transactionId: "txn_123" },
        data: { status: "Settlement" },
      });

      expect(response).toEqual({ transaction_status: "settlement" });
    });

    it("should handle unexpected transaction status", async () => {
      prisma.payment.findUnique.mockResolvedValue({
        id: 1,
        transactionId: "txn_123",
        booking: { id: 1, user: { email: "test@example.com" } },
      });

      snap.transaction.status.mockResolvedValue({ transaction_status: "unknown" });

      await expect(checkPaymentStatus("txn_123")).rejects.toThrow("Transaction status tidak dikenali");
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

    it("should handle error if coreApi charge fails", async () => {
      const mockBooking = {
        id: 1,
        totalPrice: 300000,
        user: { email: "test@example.com", profile: { fullName: "Test User" } },
      };
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      coreApi.charge.mockRejectedValue(new Error("GoPay payment error"));

      await expect(createGoPayPayment(1)).rejects.toThrow("GoPay payment error");
    });
  });

  describe("createCardPayment", () => {
    it("should create card payment successfully", async () => {
      const mockBooking = {
        id: 1,
        totalPrice: 800000,
        user: { email: "test@example.com", profile: { fullName: "Test User" } },
      };
    
      const mockChargeResponse = {
        transaction_id: "txn_101",
        order_id: "order_101",
        gross_amount: "800000",
        transaction_status: "capture",
      };
    
    
      prisma.booking.findUnique.mockResolvedValue(mockBooking);
      prisma.booking.update.mockResolvedValue({
        ...mockBooking,
        status: "Pending",
      });
    
     
      coreApi.charge.mockResolvedValue(mockChargeResponse);
    
     
      const mockPayment = {
        id: 1, 
        transactionId: mockChargeResponse.transaction_id,
        status: "Pending",
        bookingId: mockBooking.id,
      };
    
      prisma.payment.create.mockResolvedValue(mockPayment);
    
      const fixedTimestamp = 1734098960934;
      jest.spyOn(Date, "now").mockReturnValue(fixedTimestamp);
    
      const response = await createCardPayment(1, "validCardToken");
    
      expect(coreApi.charge).toHaveBeenCalledWith({
        payment_type: "credit_card",
        credit_card: {
          authentication: false,
          token_id: "validCardToken", 
        },
        transaction_details: {
          gross_amount: 800000, 
          order_id: `BOOKING-1-${fixedTimestamp}`, 
        },
      });
    
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          transactionId: mockChargeResponse.transaction_id,
          status: "Pending",
          bookingId: mockBooking.id,
        }),
      });
    
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: mockPayment.id },
        data: { status: "Settlement" },
      });
    
      expect(response).toEqual(mockChargeResponse);
    });
    
  });    

});
