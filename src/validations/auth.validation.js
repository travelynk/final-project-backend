import Joi from 'joi';

export const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const register = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('buyer', 'seller').required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    gender: Joi.string().valid('LakiLaki', 'Perempuan').required(),
    fullName: Joi.string().max(100).required(), // Tambahkan validasi fullName
});


export const resetPassword = Joi.object({
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});
