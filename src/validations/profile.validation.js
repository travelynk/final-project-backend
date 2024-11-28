import Joi from 'joi';

export const updateProfile = Joi.object({
  fullName: Joi.string()
    .required()
    .messages({
      'string.base': 'Nama harus berupa teks.',
      'string.empty': 'Nama tidak boleh kosong.',
      'any.required': 'Nama diperlukan.',
    }),
  phone: Joi.string()
    .pattern(/^\d+$/)
    .min(10)
    .max(15)
    .required()
    .messages({
      'string.base': 'Nomor telepon harus berupa teks.',
      'string.empty': 'Nomor telepon tidak boleh kosong.',
      'string.pattern.base': 'Nomor telepon hanya boleh berisi angka.',
      'string.min': 'Nomor telepon harus terdiri dari minimal 10 digit.',
      'string.max': 'Nomor telepon harus terdiri dari maksimal 15 digit.',
      'any.required': 'Nomor telepon diperlukan.',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email harus berupa teks.',
      'string.empty': 'Email tidak boleh kosong.',
      'string.email': 'Email harus berupa alamat email yang valid.',
      'any.required': 'Email diperlukan.',
    }),
});