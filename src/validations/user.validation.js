import joi from 'joi';

export const schemaUpdateRole = joi.object({
    role: joi.string().max(5).valid('admin', 'buyer').required().messages({
        'string.base': `Role harus berupa teks`,
        'string.empty': `Role tidak boleh kosong`,
        'string.max': `Role tidak boleh lebih dari {#limit} karakter`,
        'any.required': `Role harus diisi`,
        'any.only': `Role harus berupa 'admin' atau 'buyer'`
    })
});