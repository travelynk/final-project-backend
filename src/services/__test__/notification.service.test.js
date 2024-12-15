import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import {
  createNotification,
  getNotificationsByUserId,
  updateNotificationReadStatus,
  deleteNotification,
} from "../notification.service.js";
import prisma from "../../configs/database.js";
import { getIoInstance } from "../../configs/websocket.js";
import { Error400, Error404 } from "../../utils/customError.js";

// Mock Prisma and Socket.IO
jest.mock("../../configs/database.js", () => ({
  notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
  },
}));

jest.mock("../../configs/socket.js", () => ({
  getIoInstance: jest.fn(() => ({
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
  })),
}));

describe("Notification Service", () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });

  // Test createNotification
  describe("createNotification", () => {
    it("should create a user-specific notification and emit a socket event", async () => {
        const mockNotification = {
            id: 1,
            userId: 123,
            type: "Info",
            title: "Flight Schedule is Changed!",
            message: "click here to see the detail.",
        };

        prisma.notification.create.mockResolvedValue(mockNotification);
        const io = getIoInstance();

        const result = await createNotification(123, "info", "Test Notification", "Test message");

        expect(prisma.notification.create).toHaveBeenCalledWith({
            data: {
                userId: 123,
                type: "Info",
                title: "Flight Schedule is Changed!",
                message: "click here to see the detail.",
                isRead: false,
                isDeleted: false,
                createdAt: expect.any(Date),
            },
        });
        expect(io.to).toHaveBeenCalledWith("123");
        expect(io.emit).toHaveBeenCalledWith("notification", mockNotification);
        expect(result).toEqual(mockNotification);
    });

    it("should create a general notification and emit a global event", async () => {
        const mockNotification = {
            id: 2,
            userId: null,
            type: "Promotion",
            title: "Get a 50% Discount Now!",
            message: "test message of promotion notif",
        };

        prisma.notification.create.mockResolvedValue(mockNotification);
        const io = getIoInstance();

        const result = await createNotification(null, "info", "General Test Notification", "This is a general message");

        expect(prisma.notification.create).toHaveBeenCalledWith({
            data: {
                userId: null,
                type: "Promotion",
                title: "Get a 50% Discount Now!",
                message: "test message of promotion notif",
                isRead: false,
                isDeleted: false,
                createdAt: expect.any(Date),
            },
        });
        expect(io.emit).toHaveBeenCalledWith("notification", mockNotification);  // Expect global emit
        expect(result).toEqual(mockNotification);
    });

    it("should throw Error400 if creation fails", async () => {
        prisma.notification.create.mockRejectedValue(new Error("Database error"));

        await expect(
            createNotification(123, "info", "Test Notification", "Test message")
        ).rejects.toThrow(Error400);
    });
  });


  // Test getNotificationsByUserId
  describe("getNotificationsByUserId", () => {
      it("should return notifications for a user", async () => {
          const mockNotifications = [
              { id: 1, userId: 123, message: "Test Message 1" },
              { id: 2, userId: 123, message: "Test Message 2" },
          ];

          prisma.notification.findMany.mockResolvedValue(mockNotifications);

          const result = await getNotificationsByUserId(123);

          expect(prisma.notification.findMany).toHaveBeenCalledWith({
              where: { userId: 123, isDeleted: false },
              orderBy: { createdAt: "desc" },
          });
          expect(result).toEqual(mockNotifications);
      });

      it("should throw Error400 if fetching fails", async () => {
          prisma.notification.findMany.mockRejectedValue(new Error("Database error"));

          await expect(getNotificationsByUserId(123)).rejects.toThrow(Error400);
      });
  });

  // Test updateNotificationReadStatus
  describe("updateNotificationReadStatus", () => {
      it("should update notification read status", async () => {
          const mockNotification = { id: 1, userId: 123, isRead: true };

          prisma.notification.update.mockResolvedValue(mockNotification);

          const result = await updateNotificationReadStatus(1, 123);

          expect(prisma.notification.update).toHaveBeenCalledWith({
              where: { id: 1, userId: 123 },
              data: { isRead: true },
          });
          expect(result).toEqual({
              notification: mockNotification,
              message: "Status notifikasi berhasil diperbarui.",
          });
      });

      it("should throw Error404 if notification not found", async () => {
          prisma.notification.update.mockResolvedValue(null);

          await expect(updateNotificationReadStatus(1, 123)).rejects.toThrow(Error404);
          await expect(updateNotificationReadStatus(1, 123)).rejects.toThrow(
              "Notifikasi tidak ditemukan."
          );
      });

      it("should throw Error400 if updating fails", async () => {
          prisma.notification.update.mockRejectedValue(new Error("Database error"));

          await expect(updateNotificationReadStatus(1, 123)).rejects.toThrow(Error400);
      });
  });

  // Test deleteNotification
  describe("deleteNotification", () => {
      it("should delete a notification", async () => {
          const mockNotification = { id: 1, userId: 123, isDeleted: true };

          prisma.notification.update.mockResolvedValue(mockNotification);

          const result = await deleteNotification(1, 123);

          expect(prisma.notification.update).toHaveBeenCalledWith({
              where: { id: 1, userId: 123 },
              data: { isDeleted: true },
          });
          expect(result).toEqual({
              notification: mockNotification,
              message: "Notifikasi berhasil dihapus.",
          });
      });

      it("should throw Error404 if notification not found", async () => {
          prisma.notification.update.mockResolvedValue(null);

          await expect(deleteNotification(1, 123)).rejects.toThrow(Error404);
          await expect(deleteNotification(1, 123)).rejects.toThrow(
              "Notifikasi tidak ditemukan."
          );
      });

      it("should throw Error400 if deletion fails", async () => {
          prisma.notification.update.mockRejectedValue(new Error("Database error"));

          await expect(deleteNotification(1, 123)).rejects.toThrow(Error400);
      });
  });
});