import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { 
    createNotification, 
    getNotifications, 
    updateNotificationReadStatus, 
    deleteNotification
} from '../../controllers/notification.controller.js';
import * as response from '../../utils/response.js';
import * as NotificationService from '../../services/notification.service.js';
import { notification } from '../../validations/notification.validator.js';
import { Error400, Error404 } from '../../utils/customError.js';

// Mock dependencies
jest.mock("../../services/notification.service.js");
jest.mock("../../utils/response.js");
jest.mock("../../validations/notification.validator.js", () => ({
  notification: {
    validate: jest.fn(),
  }
}));

describe("Notification Controller", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      params: {},
      user: { id: 123, role: "buyer" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  // Test createNotification
  describe("createNotification", () => {
    it("should create a user-spesific notification and return 200", async () => {
      mockReq.body = { type: "info", title: "Test Title", message: "Test Message" };
            
      const mockNotification = {
        id: 1,
        userId: 123,
        type: "info",
        title: "Test Title",
        message: "Test Message",
      };

      notification.validate.mockResolvedValue({ value: mockReq.body });

      NotificationService.createNotification.mockResolvedValue(mockNotification);

      await createNotification(mockReq, mockRes, mockNext);

      expect(NotificationService.createNotification).toHaveBeenCalledWith( 
        123,
        "info",
        "Test Title",
        "Test Message"
      );
      expect(response.res201).toHaveBeenCalledWith("Notifikasi berhasil dibuat", mockNotification, mockRes);
    });

    it("should create a user-general notification and return 201", async () => {
      mockReq.user.role = "admin";
      mockReq.body = { type: "info", title: "Test Title", message: "Test Message" };
            
      const mockNotification = {
        id: 1,
        userId: null,
        type: "info",
        title: "Test Title",
        message: "Test Message",
      };

      notification.validate.mockResolvedValue({ value: mockReq.body });

      NotificationService.createNotification.mockResolvedValue(mockNotification);

      await createNotification(mockReq, mockRes, mockNext);

      expect(NotificationService.createNotification).toHaveBeenCalledWith( 
        null,
        "info",
        "Test Title",
        "Test Message"
      );
      expect(response.res201).toHaveBeenCalledWith("Notifikasi berhasil dibuat", mockNotification, mockRes);
    });

    it("should create a general notification when userId is null", async () => {
        mockReq.user.id = null;
        mockReq.body = { 
          type: "info", 
          title: "General Announcement", 
          message: "This is a system-wide message"
        };
    
        const mockNotification = {
            id: 1,
            userId: null, 
            type: "info",
            title: "General Announcement",
            message: "This is a system-wide message",
        };
    
        NotificationService.createNotification.mockResolvedValue(mockNotification);
    
        await createNotification(mockReq, mockRes, mockNext);
    
        expect(NotificationService.createNotification).toHaveBeenCalledWith(
            null,
            "info",
            "General Announcement",
            "This is a system-wide message"
        );
        expect(response.res201).toHaveBeenCalledWith(
            "Notifikasi berhasil dibuat",
            mockNotification,
            mockRes
        );
    });

    it("should call next with Error400 if validation error", async () => {
        const validationError = { details: [{ message: "Validation error" }] };
        notification.validate.mockReturnValue({ error: validationError });

        await createNotification(mockReq, mockRes, mockNext);

        expect(NotificationService.createNotification).not.toHaveBeenCalled();
        expect(response.res201).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error400);
        expect(mockNext.mock.calls[0][0].message).toBe("Validation error");
    });

    it("should call next with error if service throws an error", async () => {
        const serviceError = new Error("Service error");
        notification.validate.mockResolvedValue({ value: mockReq.body });
        NotificationService.createNotification.mockRejectedValue(serviceError);

        await createNotification(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(serviceError);
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

      expect(NotificationService.deleteNotification).toHaveBeenCalledWith(1, 123, mockReq.user.role);
      expect(response.res200).toHaveBeenCalledWith(
        "Notifikasi berhasil dihapus.",
        mockNotification,
        mockRes
      );
    });

    it("should call next with Error404 if notification not found", async () => {
      mockReq.params.id = "1";
      NotificationService.deleteNotification.mockRejectedValue(new Error404());

      await deleteNotification(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error404));
    });
  });
});