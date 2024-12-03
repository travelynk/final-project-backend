import Joi from "joi";

export const storeBooking = Joi.object({
  // userId: Joi.number().integer().positive().required()
  //   .messages({
  //     'number.base': 'userId harus berupa angka.',
  //     'number.integer': 'userId harus berupa angka bulat.',
  //     'number.positive': 'userId harus bernilai positif.',
  //     'any.required': 'userId wajib diisi.'
  //   }),
  roundTrip: Joi.boolean().required()
    .messages({
      'boolean.base': 'roundTrip harus berupa nilai boolean.',
      'any.required': 'roundTrip wajib diisi.'
    }),
  totalPrice: Joi.number().precision(2).positive().required()
    .messages({
      'number.base': 'totalPrice harus berupa angka.',
      'number.precision': 'totalPrice harus memiliki dua angka di belakang koma.',
      'number.positive': 'totalPrice harus bernilai positif.',
      'any.required': 'totalPrice wajib diisi.'
    }),
  tax: Joi.number().precision(2).positive().required()
    .messages({
      'number.base': 'tax harus berupa angka.',
      'number.precision': 'tax harus memiliki dua angka di belakang koma.',
      'number.positive': 'tax harus bernilai positif.',
      'any.required': 'tax wajib diisi.'
    }),
  disc: Joi.number().precision(2).positive().required()
    .messages({
      'number.base': 'disc harus berupa angka.',
      'number.precision': 'disc harus memiliki dua angka di belakang koma.',
      'number.positive': 'disc harus bernilai positif.',
      'any.required': 'disc wajib diisi.'
    }),
  passengerCount: Joi.object({
    adult: Joi.number().integer().min(0).required()
      .messages({
        'number.base': 'adult harus berupa angka.',
        'number.integer': 'adult harus berupa angka bulat.',
        'number.min': 'adult harus bernilai 0 atau lebih.',
        'any.required': 'adult wajib diisi.'
      }),
    child: Joi.number().integer().min(0).required()
      .messages({
        'number.base': 'child harus berupa angka.',
        'number.integer': 'child harus berupa angka bulat.',
        'number.min': 'child harus bernilai 0 atau lebih.',
        'any.required': 'child wajib diisi.'
      }),
    infant: Joi.number().integer().min(0).required()
      .messages({
        'number.base': 'infant harus berupa angka.',
        'number.integer': 'infant harus berupa angka bulat.',
        'number.min': 'infant harus bernilai 0 atau lebih.',
        'any.required': 'infant wajib diisi.'
      })
  }).required()
    .messages({
      'any.required': 'passengerCount wajib diisi.'
    }),
  flightSegments: Joi.array().items(
    Joi.object({
      flightId: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'flightId harus berupa angka.',
          'number.integer': 'flightId harus berupa angka bulat.',
          'number.positive': 'flightId harus bernilai positif.',
          'any.required': 'flightId wajib diisi.'
        }),
      isReturn: Joi.boolean().required()
        .messages({
          'boolean.base': 'isReturn harus berupa nilai boolean.',
          'any.required': 'isReturn wajib diisi.'
        }),
      seatId: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'seatId harus berupa angka.',
          'number.integer': 'seatId harus berupa angka bulat.',
          'number.positive': 'seatId harus bernilai positif.',
          'any.required': 'seatId wajib diisi.'
        }),
      passenger: Joi.object({
        title: Joi.string().required().messages({
          'string.base': 'title harus berupa string.',
          'any.required': 'title wajib diisi.',
        }),
        identityNumber: Joi.string().alphanum().length(16).required()
          .messages({
            'string.base': 'identityNumber harus berupa string.',
            'string.alphanum': 'identityNumber harus hanya mengandung angka dan huruf.',
            'string.length': 'identityNumber harus terdiri dari 16 karakter.',
            'any.required': 'identityNumber wajib diisi.'
          }),
        fullName: Joi.string().min(1).max(100).required()
          .messages({
            'string.base': 'fullName harus berupa string.',
            'string.min': 'fullName harus memiliki panjang minimal 1 karakter.',
            'string.max': 'fullName tidak boleh melebihi 100 karakter.',
            'any.required': 'fullName wajib diisi.'
          }),
        familyName: Joi.string().min(1).max(50).optional()
          .messages({
            'string.base': 'familyName harus berupa string.',
            'string.min': 'familyName harus memiliki panjang minimal 1 karakter.',
            'string.max': 'familyName tidak boleh melebihi 50 karakter.'
          }),
        dob: Joi.date().iso().required()
          .messages({
            'date.base': 'dob harus berupa tanggal yang valid.',
            'any.required': 'dob wajib diisi.'
          }),
        nationality: Joi.string().min(1).max(50).required()
          .messages({
            'string.base': 'nationality harus berupa string.',
            'string.min': 'nationality harus memiliki panjang minimal 1 karakter.',
            'string.max': 'nationality tidak boleh melebihi 50 karakter.',
            'any.required': 'nationality wajib diisi.'
          }),
        issuingCountry: Joi.string().min(1).max(50).required()
          .messages({
            'string.base': 'issuingCountry harus berupa string.',
            'string.min': 'issuingCountry harus memiliki panjang minimal 1 karakter.',
            'string.max': 'issuingCountry tidak boleh melebihi 50 karakter.',
            'any.required': 'issuingCountry wajib diisi.'
          }),
        identityExp: Joi.date().iso().required()
          .messages({
            'date.base': 'identityExp harus berupa tanggal yang valid.',
            'any.required': 'identityExp wajib diisi.'
          })
      }).required()
        .messages({
          'any.required': 'passenger wajib diisi.'
        })
    })
  ).min(1).required()
    .messages({
      'array.min': 'flightSegments harus memiliki minimal 1 segmen penerbangan.',
      'any.required': 'flightSegments wajib diisi.'
    })
});

export const updateStatusBookingBody = Joi.object({
  status: Joi.string()
    .valid('Pending', 'Confirmed', 'Cancelled')
    .required()
    .messages({
      'any.required': 'Status booking harus diisi.',
      'string.empty': 'Status booking tidak boleh kosong.',
      'any.only': 'Status booking harus salah satu dari: Pending, Confirmed, Cancelled.',
    }),
});


export const getBooking = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Id harus berupa angka.",
      "number.integer": "Id harus berupa bilangan bulat.",
      "number.positive": "Id harus bilangan positif.",
      "any.required": "Parameter Id diperlukan.",
    }),
});

export const updateStatusBookingParams = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Id harus berupa angka.",
      "number.integer": "Id harus berupa bilangan bulat.",
      "number.positive": "Id harus bilangan positif.",
      "any.required": "Parameter Id diperlukan.",
    }),
});

export const getBookingsByDate = Joi.object({
  startDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'startDate harus dalam format ISO 8601 (YYYY-MM-DD)',
    }),
  endDate: Joi.date()
    .iso()
    .greater(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.format': 'endDate harus dalam format ISO 8601 (YYYY-MM-DD)',
      'date.greater': 'endDate harus lebih besar dari startDate',
    }),
});