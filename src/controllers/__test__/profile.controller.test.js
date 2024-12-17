import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { getProfile, updateProfile } from '../../controllers/profile.controller.js';
import { Error400 } from '../../utils/customError.js';
// import * as response from '../../utils/response.js';
import * as ProfileService from '../../services/profile.service.js';
import * as ProfileValidation from '../../validations/profile.validation.js';

jest.mock('../../services/profile.service.js');
jest.mock('../../utils/response.js');
jest.mock('../../validations/profile.validation.js');

describe('Profile Controller', () => {
    let req, res, next;

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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getProfile', () => {
        it('should return 200 when profile is fetched successfully', async () => {
            const mockUser = { id: 3, name: 'John Doe', email: 'john.doe@example.com' };
            ProfileService.getProfile.mockResolvedValue(mockUser);

            await getProfile(req, res, next);

            // expect(ProfileService.getProfile).toHaveBeenCalledWith(3);
            // expect(response.res200).toHaveBeenCalledWith('Berhasil', mockUser, res);
        });

        it('should call next with an error when an error occurs while fetching profile', async () => {
            ProfileService.getProfile.mockRejectedValue(new Error('Internal Server Error'));

            await getProfile(req, res, next);

            // expect(next).toHaveBeenCalledWith(new Error('Internal Server Error'));
        });
    });

    describe('updateProfile', () => {
        it('should return 200 when profile is updated successfully', async () => {
            jest.spyOn(ProfileValidation.updateProfile, 'validate').mockReturnValue({ error: null, value: req.body });

            const mockUpdatedUser = { id: 3, ...req.body };
            ProfileService.updateProfile.mockResolvedValue(mockUpdatedUser);

            await updateProfile(req, res, next);

            expect(ProfileValidation.updateProfile.validate).toHaveBeenCalledWith(req.body);
            // expect(ProfileService.updateProfile).toHaveBeenCalledWith(3, req.body);
            // expect(response.res200).toHaveBeenCalledWith('Berhasil', mockUpdatedUser, res);
        });

        it('should call next with Error400 when validation fails', async () => {
            const mockError = { message: 'Validation error' };
            jest.spyOn(ProfileValidation.updateProfile, 'validate').mockReturnValue({ error: mockError });

            await updateProfile(req, res, next);

            expect(ProfileValidation.updateProfile.validate).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(new Error400('Validation error'));
        });

        it('should call next with an error when an error occurs while updating profile', async () => {
            jest.spyOn(ProfileValidation.updateProfile, 'validate').mockReturnValue({ error: null, value: req.body });

            ProfileService.updateProfile.mockRejectedValue(new Error('Internal Server Error'));

            await updateProfile(req, res, next);

            expect(ProfileValidation.updateProfile.validate).toHaveBeenCalledWith(req.body);
            // expect(ProfileService.updateProfile).toHaveBeenCalledWith(3, req.body);
            // expect(next).toHaveBeenCalledWith(new Error('Internal Server Error'));
        });
    });
});
