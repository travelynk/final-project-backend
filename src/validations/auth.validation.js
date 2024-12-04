import Joi from 'joi';

export const login = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email harus berupa teks.',
      'string.empty': 'Email tidak boleh kosong.',
      'string.email': 'Email harus berupa alamat email yang valid.',
      'any.required': 'Email diperlukan.',
    }),
  password: Joi.string()
    .min(8)
    .max(20)
    .required()
    .messages({
      'string.base': 'Password harus berupa teks.',
      'string.empty': 'Password tidak boleh kosong.',
      'string.min': 'Password harus terdiri dari minimal 8 karakter.',
      'string.max': 'Password harus terdiri dari maksimal 20 karakter.',
      'any.required': 'Password diperlukan.',
    }),
});

export const resetPassword = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'password complexity')
    .required()
    .messages({
      'string.pattern.name': 'Kata sandi baru harus mencakup setidaknya satu huruf besar, satu huruf kecil, dan satu angka.',
      'string.min': 'Kata sandi baru harus terdiri dari minimal 8 karakter.',
      'any.required': 'Kata sandi baru diperlukan.',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Konfirmasi kata sandi harus cocok dengan kata sandi baru.',
      'any.required': 'Konfirmasi kata sandi diperlukan.',
    }),
});

export const register = Joi.object({
  fullName: Joi.string()
    .required()
    .messages({
      'string.base': 'Nama harus berupa teks.',
      'string.empty': 'Nama tidak boleh kosong.',
      'any.required': 'Nama diperlukan.',
    }),
  // last_name: Joi.string()
  //   .required()
  //   .messages({
  //     'string.base': 'Last name must be a text.',
  //     'string.empty': 'Last name cannot be empty.',
  //     'any.required': 'Last name is required.',
  //   }),
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
  password: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.base': 'Password harus berupa teks.',
      'string.empty': 'Password tidak boleh kosong.',
      'string.min': 'Password harus terdiri dari minimal 10 karakter.',
      'any.required': 'Password diperlukan.',
    }),
  // gender: Joi.string().valid('Laki-laki', 'Perempuan').required().messages({
  //   'string.valid': 'Gender harus Laki-laki atau Perempuan.',
  //   'any.required': 'Gender wajib diisi.'
  // }),
});

export const sendOtp = Joi.object({
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

export const verifyOtp = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email harus berupa teks.',
      'string.empty': 'Email tidak boleh kosong.',
      'string.email': 'Email harus berupa alamat email yang valid.',
      'any.required': 'Email diperlukan.',
    }),
    otp: Joi.string()
    .length(6) 
    .required()
    .messages({
      'string.base': 'OTP harus berupa teks.',
      'string.empty': 'OTP tidak boleh kosong.',
      'string.length': 'OTP harus tepat 6 karakter.',
      'any.required': 'OTP diperlukan.',
    }),
});
