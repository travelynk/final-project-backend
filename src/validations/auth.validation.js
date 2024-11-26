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


// export const resetPassword = Joi.object({
//     newPassword: Joi.string().min(6).required(),
//     confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
// });

export const resetPassword = Joi.object({
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'password complexity')
        .required()
        .messages({
            'string.pattern.name': 'New password must include at least one uppercase letter, one lowercase letter, and one number.',
            'string.min': 'New password must be at least 8 characters long.',
            'any.required': 'New password is required.',
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Confirm password must match the new password.',
            'any.required': 'Confirm password is required.',
        }),
});