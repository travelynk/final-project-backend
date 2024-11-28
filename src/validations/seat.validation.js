import Joi from "joi";

export const getSeatsByFlightID = Joi.object({
  flightId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "flightId harus berupa angka.",
      "number.integer": "flightId harus berupa bilangan bulat.",
      "number.positive": "flightId harus bilangan positif.",
      "any.required": "Parameter flightId diperlukan.",
    }),
});
