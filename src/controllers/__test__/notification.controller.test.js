import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import {
  createNotification,
  getNotifications,
  updateNotificationReadStatus,
  deleteNotification
} from '../../controllers/notification.controller.js';
import * as response from '../../utils/response.js';
import { Error400, Error404 } from '../../utils/customError.js';

// Mock dependencies
jest.mock("../../services/notification.service.js");
import * as NotificationService from '../../services/notification.service.js';
jest.mock("../../utils/response.js");

describe("Notification Controller", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {
        type: "info",
        title: "Test Notification",
        message: "This is a test message",
      },
      user: { id: 123 }, // Gunakan angka
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    jest.spyOn(response, "res200").mockImplementation((message, data, res) => {
      res.status(200).json({ message, data });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test createNotification
  describe("createNotification", () => {
    // it("should create a user-specific notification and return 200", async () => {
    //   const mockResult = { id: 1, ...mockReq.body };

    //   NotificationService.createNotification.mockResolvedValue(mockResult);

    //   await createNotification(mockReq, mockRes, mockNext);

    //   expect(NotificationService.createNotification).toHaveBeenCalledWith(123);

    //   expect(response.res200).toHaveBeenCalledWith(
    //     "Notifikasi berhasil dibuat",
    //     mockResult,
    //     mockRes
    //   );
    //   expect(mockNext).not.toHaveBeenCalled();
    // });

    it("should call next with Error400 if validation fails", async () => {
      mockReq.body = { type: "", title: "", message: "" };

      await createNotification(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error400));
    });
  });

  // Test getNotifications
  describe("getNotifications", () => {
    it("should return a list of notifications", async () => {
      const mockNotifications = [
        { id: 1, userId: 123, message: "Test Message 1" },
        { id: 2, userId: 123, message: "Test Message 2" },
      ];

      NotificationService.getNotificationsByUserId.mockResolvedValue(mockNotifications);

      await getNotifications(mockReq, mockRes, mockNext);

      expect(NotificationService.getNotificationsByUserId).toHaveBeenCalledWith(123);
      expect(response.res200).toHaveBeenCalledWith(
        "Berhasil mendapatkan notifikasi.",
        mockNotifications,
        mockRes
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with Error404 if no notifications found", async () => {
      NotificationService.getNotificationsByUserId.mockResolvedValue([]);

      await getNotifications(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error404));
    });
  });

  // Test updateNotificationReadStatus
  describe("updateNotificationReadStatus", () => {
    it("should update notification read status and return 200", async () => {
      mockReq.params.id = "1";

      const mockNotification = { id: 1, isRead: true };

      NotificationService.updateNotificationReadStatus.mockResolvedValue({
        notification: mockNotification,
      });

      await updateNotificationReadStatus(mockReq, mockRes, mockNext);

      expect(NotificationService.updateNotificationReadStatus).toHaveBeenCalledWith(1, 123);
      expect(response.res200).toHaveBeenCalledWith(
        "Status notifikasi berhasil diperbarui.",
        mockNotification,
        mockRes
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with Error404 if notification not found", async () => {
      mockReq.params.id = "1";

      NotificationService.updateNotificationReadStatus.mockRejectedValue(new Error404());

      await updateNotificationReadStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error404));
    });
  });

  // Test deleteNotification
  describe("deleteNotification", () => {
    it("should delete notification and return 200", async () => {
      mockReq.params.id = "1";

      const mockNotification = { id: 1, isDeleted: true };

      NotificationService.deleteNotification.mockResolvedValue({
        notification: mockNotification,
      });

      await deleteNotification(mockReq, mockRes, mockNext);

      expect(NotificationService.deleteNotification).toHaveBeenCalledWith(1, 123);
      expect(response.res200).toHaveBeenCalledWith(
        "Notifikasi berhasil dihapus.",
        mockNotification,
        mockRes
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with Error404 if notification not found", async () => {
      mockReq.params.id = "1";

      NotificationService.deleteNotification.mockRejectedValue(new Error404());

      await deleteNotification(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error404));
    });
  });
});
