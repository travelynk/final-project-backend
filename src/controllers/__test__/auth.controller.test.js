import { login } from '../../controllers/auth.controller.js';
import * as response from '../../utils/response.js';
import * as AuthService from '../../services/auth.service.js';
import * as AuthValidation from '../../validations/auth.validation.js';

jest.mock('../../services/auth.service.js');
jest.mock('../../utils/response.js');

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                email: 'fulan@gmail.com',
                password: '12345'
            }
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return 200 when login succeeds', async () => {
            // Mock validation result
            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });

            // Mock AuthService.login to return a token
            const mockToken = 'mock-token';
            AuthService.login.mockResolvedValue(mockToken);

            // Call the controller
            await login(req, res);

            // Assertions
            expect(AuthValidation.login.validate).toHaveBeenCalledWith(req.body);
            expect(AuthService.login).toHaveBeenCalledWith(req.body);
            expect(response.res200).toHaveBeenCalledWith('Login Success', mockToken, res);
        });

        it('should return 400 when validation fails', async () => {
            // Mock validation result with an error
            const mockError = { details: [{ message: 'Validation error' }] };
            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: mockError });

            // Call the controller
            await login(req, res);

            // Assertions
            expect(AuthValidation.login.validate).toHaveBeenCalledWith(req.body);
            expect(response.res400).toHaveBeenCalledWith('Validation error', res);
        });

        it('should return 500 when an internal error occurs', async () => {
            // Mock validation result
            jest.spyOn(AuthValidation.login, 'validate').mockReturnValue({ error: null, value: req.body });

            // Mock AuthService.login to throw an error
            AuthService.login.mockRejectedValue(new Error('Internal Server Error'));

            // Call the controller
            await login(req, res);

            // Assertions
            expect(AuthValidation.login.validate).toHaveBeenCalledWith(req.body);
            expect(AuthService.login).toHaveBeenCalledWith(req.body);
            expect(response.res500).toHaveBeenCalledWith(res);
        });
    });
});
