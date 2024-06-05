import Joi from 'joi';


export const pagination = Joi.object().keys({
  paginatedField: Joi.string().required(),
  sortAscending: Joi.boolean().required(),
  previous: Joi.string().optional(),
  next: Joi.string().optional(),
  limit: Joi.number().optional()
});


export const paginations = Joi.object().keys({
  pageNumber: Joi.number().optional(),
  sortAscending: Joi.boolean().required(),
  pageSize: Joi.number().optional(),
});
export const address = Joi.object().keys({
  contactDetails: Joi.string().required().allow(null),
  addressType: Joi.string().required().allow(null),
  buildingDetails: Joi.string().required(),
  area: Joi.string().required().allow(null),
  city: Joi.string().required().allow(null),
  pinCode: Joi.string().optional().allow(null),
  landmark: Joi.string().optional().allow(null),
  geoLocation: Joi.array().optional().items(Joi.number().required()).min(2).max(2)
});  