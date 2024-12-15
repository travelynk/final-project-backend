import Joi from 'joi';

export const storeVoucher = Joi.object({
  code: Joi.string()
    .alphanum()
    .length(8)
    .required()
    .messages({
      'string.empty': 'Kode voucher harus diisi.',
      'string.alphanum': 'Kode voucher hanya boleh berisi huruf dan angka.',
      'string.length': 'Kode voucher harus terdiri dari 8 karakter.',
    }),

  type: Joi.string()
    .valid('Percentage', 'Fixed')
    .required()
    .messages({
      'any.only': 'Tipe voucher harus berupa "percentage" atau "fixed".',
      'string.empty': 'Tipe voucher harus diisi.',
    }),

  value: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Value harus berupa angka.',
      'number.positive': 'Value harus bernilai positif.',
      'any.required': 'Value wajib diisi.',
    }),

  minPurchase: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Minimal pembelian harus berupa angka.',
      'number.positive': 'Minimal pembelian harus lebih besar dari 0.',
      'any.required': 'Minimal pembelian harus diisi.',
    }),

  maxVoucher: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Nilai maksimal voucher harus berupa angka.',
      'number.integer': 'Nilai maksimal voucher harus berupa bilangan bulat.',
      'number.positive': 'Nilai maksimal voucher harus lebih besar dari 0.',
      'any.required': 'Nilai maksimal voucher harus diisi.',
    }),

  startDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Tanggal mulai harus berupa tanggal yang valid.',
      'date.format': 'Tanggal mulai harus dalam format ISO.',
      'any.required': 'Tanggal mulai harus diisi.',
    }),

  endDate: Joi.date()
    .iso()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.base': 'Tanggal berakhir harus berupa tanggal yang valid.',
      'date.format': 'Tanggal berakhir harus dalam format ISO.',
      'date.greater': 'Tanggal berakhir harus setelah tanggal mulai.',
      'any.required': 'Tanggal berakhir harus diisi.',
    }),
});

export const getVoucherByCodeParams = Joi.object({
  code: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.base': 'Code harus berupa string.',
      'string.alphanum': 'Code hanya boleh berisi karakter alfanumerik.',
      'string.empty': 'Code tidak boleh kosong.',
      'string.min': 'Code harus memiliki minimal {#limit} karakter.',
      'string.max': 'Code tidak boleh lebih dari {#limit} karakter.',
      'any.required': 'Code wajib diisi.'
    })
});

export const getVoucherByCodeBody = Joi.object({
  totalPrice: Joi.number()
    .required()
    .min(0)
    .precision(2)
    .messages({
      'number.base': 'Total price harus berupa angka.',
      'number.min': 'Total price tidak boleh kurang dari 0.',
      'number.precision': 'Total price hanya boleh memiliki hingga 2 angka desimal.',
      'any.required': 'Total price wajib diisi.',
    })
});


export const updateVoucherBody = Joi.object({
  type: Joi.string().valid('Percentage', 'Fixed').optional().messages({
    'any.only': 'Tipe voucher harus salah satu dari: Percentage, Fixed.',
  }),
  value: Joi.number().positive().optional().messages({
    'number.base': 'Nilai harus berupa angka.',
    'number.positive': 'Nilai harus lebih besar dari nol.',
  }),
  minPurchase: Joi.number().positive().optional().messages({
    'number.base': 'Pembelian minimal harus berupa angka.',
    'number.positive': 'Pembelian minimal harus lebih besar dari nol.',
  }),
  maxVoucher: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Voucher maksimal harus berupa angka.',
    'number.min': 'Voucher maksimal harus setidaknya 1.',
  }),
  startDate: Joi.date().iso().optional().messages({
    'date.base': 'Tanggal mulai harus berupa tanggal yang valid.',
    'date.format': 'Tanggal mulai harus dalam format ISO.',
  }),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional().messages({
    'date.base': 'Tanggal selesai harus berupa tanggal yang valid.',
    'date.format': 'Tanggal selesai harus dalam format ISO.',
    'date.greater': 'Tanggal selesai harus lebih besar dari tanggal mulai.',
  }),

})
  .and('startDate', 'endDate')
  .messages({
    'object.and': 'startDate dan endDate harus diberikan bersamaan.',
  });

export const updateVoucherParams = Joi.object({
  code: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.base': 'Code harus berupa string.',
      'string.alphanum': 'Code hanya boleh berisi karakter alfanumerik.',
      'string.empty': 'Code tidak boleh kosong.',
      'string.min': 'Code harus memiliki minimal {#limit} karakter.',
      'string.max': 'Code tidak boleh lebih dari {#limit} karakter.',
      'any.required': 'Code wajib diisi.'
    })
});

export const getVoucherById = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "id harus berupa angka.",
      "number.integer": "id harus berupa bilangan bulat.",
      "number.positive": "id harus bilangan positif.",
      "any.required": "Parameter id diperlukan.",
    }),
});