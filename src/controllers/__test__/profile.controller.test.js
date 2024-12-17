import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { Error400, Error404 } from '../../utils/customError.js';
import * as ProfileService from '../../services/profile.service.js';
import * as ProfileValidation from '../../validations/profile.validation.js';
import * as response from '../../utils/response.js';

jest.mock('../../services/profile.service.js');
jest.mock('../../utils/response.js');

import { getProfile, updateProfile } from '../profile.controller.js';

describe('Profile Controller', () => {
    let req, res, next, mockData;

    beforeEach(() => {
        req = {
            body: {
                name: 'John Doe',
                email: 'john.doe@example.com',
                age: 30
            }
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        mockData = {
            "id": 3,
            "fullName": "Travelynk",
            "phone": "1234567890",
            "email": "travelynk@test.com"
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getProfile', () => {
        it('should return 200 on successful get profile', async () => {
            req.user = { id: 123 };
            ProfileService.getProfile.mockResolvedValue(mockData);

            await getProfile(req, res, next);

            expect(response.res200).toHaveBeenCalledWith('Berhasil', mockData, res);
        });

        it('should return 404 if user is not found', async () => {
            req.user = { id: 8 };
            ProfileService.getProfile.mockRejectedValue({ code: 'P2025' });

            await getProfile(req, res, next);

            expect(next).toHaveBeenCalledWith({ code: 'P2025' });
        });
    });

    describe('updateProfile', () => {
        it('should return 400 on validation error', async () => {
            req.body = { name: 'mockName', email: 'mockEmail' };
            jest.spyOn(ProfileValidation.updateProfile, 'validate').mockReturnValue({
                error: { message: 'Validation error' },
            });

            await updateProfile(req, res, next);
            expect(next).toHaveBeenCalledWith(new Error400('Validation error'));
        });

        it('should return 200 on successful profile update', async () => {
            const mockUpdatedUser = { id: 3, ...req.body };
            jest.spyOn(ProfileValidation.updateProfile, 'validate').mockReturnValue({ error: null, value: req.body });
            req.user = { id: '123' };

            ProfileService.updateProfile.mockResolvedValue(mockUpdatedUser);

            await updateProfile(req, res, next);

            expect(response.res200).toHaveBeenCalledWith('Berhasil', mockUpdatedUser, res);
        });

        it('should return 404 if user is not found', async () => {
            req.user = { id: '123' };
            jest.spyOn(ProfileValidation.updateProfile, 'validate').mockReturnValue({ error: null, value: req.body });

            ProfileService.updateProfile.mockRejectedValue({ code: 'P2025' });

            await updateProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error404('Pengguna tidak ditemukan. Pastikan informasi yang Anda masukkan sudah benar dan coba lagi.'));
        });

        it('should return 500 on error', async () => {
            req.user = { id: '123' };
            jest.spyOn(ProfileValidation.updateProfile, 'validate').mockReturnValue({ error: null, value: req.body });

            ProfileService.updateProfile.mockRejectedValue(new Error('Unexpected error'));

            await updateProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error('Unexpected error'));
        });

    });

});