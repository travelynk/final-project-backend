import Joi from 'joi';

export const notification = Joi.object({
  userId: Joi.number().optional(),  
  type: Joi.string()
      .valid('Promotion', 'Info')
      .required()
      .messages({
        'string.base': 'Tipe notifikasi harus berupa teks.',
        'string.empty': 'Tipe notifikasi tidak boleh kosong.',
        'any.required': 'Tipe notifikasi diperlukan.',
      }),
    title: Joi.string()
      .min(10)
      .max(255)
      .required()
      .messages({
        'string.base': 'Judul notifikasi harus berupa teks.',
        'string.empty': 'Judul notifikasi tidak boleh kosong.',
        'string.min': 'Judul notifikasi harus terdiri dari minimal 10 karakter.',
        'string.max': 'Judul notifikasi harus terdiri dari maksimal 255 karakter.',
        'any.required': 'Judul notifikasi diperlukan.',
      }),
    message: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.base': 'Pesan notifikasi harus berupa teks.',
      'string.empty': 'Pesan notifikasi tidak boleh kosong.',
      'string.min': 'Pesan notifikasi harus terdiri dari minimal 10 karakter.',
      'any.required': 'Pesan notifikasi diperlukan.',
    }),
});
