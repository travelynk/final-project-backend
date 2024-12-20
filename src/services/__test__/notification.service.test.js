import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import {
  createNotification,
  getNotificationsByUserId,
  updateNotificationReadStatus,
  deleteNotification,
} from "../notification.service.js";
import prisma from "../../configs/database.js";
import { Error404 } from "../../utils/customError.js";

// Mock Prisma and Socket.IO
jest.mock("../../configs/database.js", () => ({
  notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
  },
}));

describe("Notification Service", () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });

  // Test createNotification
  describe("createNotification", () => {
    it("should create a user-specific notification", async () => {
        const mockNotification = {
            id: 1,
            userId: 123,
            type: "Info",
            title: "Flight Schedule is Changed!",
            message: "click here to see the detail.",
            isDeleted: false,
            isRead: false,
            createdAt: new Date(),
        };

        prisma.notification.create.mockResolvedValue(mockNotification);
        
        const result = await createNotification(
            mockNotification.userId,
            mockNotification.type,
            mockNotification.title,
            mockNotification.message
        );

        expect(result).toEqual(mockNotification);
        expect(prisma.notification.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: 123,
                type: "Info",
                title: "Flight Schedule is Changed!",
                message: "click here to see the detail.",
                isRead: false,
                isDeleted: false,
                createdAt: expect.any(Date),
            }),
        });
    });

    it("should create a general notification", async () => {
        const mockNotification = {
            id: 2,
            userId: null,
            type: "Promotion",
            title: "Get a 50% Discount Now!",
            message: "test message of promotion notif",
            isDeleted: false,
            isRead: false,
            createdAt: new Date(),
        };

        prisma.notification.create.mockResolvedValue(mockNotification);

        const result = await createNotification(
            mockNotification.userId,
            mockNotification.type,
            mockNotification.title,
            mockNotification.message
        );

        expect(result).toEqual(mockNotification);
        expect(prisma.notification.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: null,
                type: "Promotion",
                title: "Get a 50% Discount Now!",
                message: "test message of promotion notif",
                isRead: false,
                isDeleted: false,
                createdAt: expect.any(Date),
            }),
        });
    });
  });


  // Test getNotificationsByUserId
  describe("getNotificationsByUserId", () => {
      it("should return notifications for a user", async () => {
        const mockNotifications = [
            { id: 1, userId: null, type: 'Promotion', title: 'Update', message: 'Message 1', isRead: false, isDeleted: false, createdAt: new Date() },
            { id: 2, userId: 1, type: 'Info', title: 'Warning', message: 'Message 2', isRead: false, isDeleted: false, createdAt: new Date() },
        ];

        const userId = 1;

        prisma.notification.findMany.mockResolvedValue(mockNotifications);

        const result = await getNotificationsByUserId(userId);

        expect(prisma.notification.findMany).toHaveBeenCalledWith({
            where: {
                AND: [
                    { isDeleted: false },
                    { OR: [{ userId: userId }, { userId: null }] },
                ]
            },
            orderBy: { createdAt: 'desc' },
        });
        expect(result).toEqual(mockNotifications);
      });
  });

  // Test updateNotificationReadStatus
  describe("updateNotificationReadStatus", () => {
      it("should update notification read status", async () => {
          const mockNotification = {
            id: 1,
            userId: 123,
            type: "Info",
            title: "Flight Schedule is Changed!",
            message: "click here to see the detail.",
            createdAt: new Date(),
            isDeleted: false,
            isRead: false,
          };

          prisma.notification.findUnique.mockResolvedValueOnce(mockNotification);
          prisma.notification.update.mockResolvedValue(mockNotification); 

          const result = await updateNotificationReadStatus(1, 123);  

          expect(result.notification).toEqual(mockNotification);
          expect(prisma.notification.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { isRead: true },
            });
        });


      it("should throw Error404 if notification not found", async () => {
          prisma.notification.findUnique.mockResolvedValueOnce(null);

          await expect(updateNotificationReadStatus(1, 123)).rejects.toThrow(Error404);
          expect(prisma.notification.update).not.toHaveBeenCalled();
        });
  });

  // Test deleteNotification
  describe("deleteNotification", () => {
      it("should delete a notification", async () => {
          const mockNotification = {
            id: 1,
            userId: 123,
            type: "Info",
            title: "Flight Schedule is Changed!",
            message: "click here to see the detail.",
            createdAt: new Date(),
            isDeleted: false,
            isRead: true,
          };

          prisma.notification.findUnique.mockResolvedValueOnce(mockNotification);
          prisma.notification.update.mockResolvedValue(mockNotification);

          const result = await deleteNotification(1, 123);

          expect(result.notification).toEqual(mockNotification);
          expect(prisma.notification.update).toHaveBeenCalledWith({
              where: { id: 1 },
              data: { isDeleted: true },
          });
      });

      it("should delete a notification", async () => {
        const mockNotification = {
          id: 1,
          userId: 123,
          type: "Info",
          title: "Flight Schedule is Changed!",
          message: "click here to see the detail.",
          createdAt: new Date(),
          isDeleted: false,
          isRead: true,
        };

        prisma.notification.findUnique.mockResolvedValueOnce(mockNotification);
        prisma.notification.update.mockResolvedValue(mockNotification);

        const result = await deleteNotification(1, 123, "admin");

        expect(result.notification).toEqual(mockNotification);
        expect(prisma.notification.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { isDeleted: true },
        });
    });

      it("should throw Error404 if notification not found", async () => {
          prisma.notification.findUnique.mockResolvedValueOnce(null);

          await expect(deleteNotification(1, 123)).rejects.toThrow(Error404);
          expect(prisma.notification.update).not.toHaveBeenCalled();
      });
    });
});