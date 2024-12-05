import Joi from "joi";
export const payElectricityBill = Joi.object().keys({
    item_code: Joi.string().required(),
    biller_code: Joi.string().required(),
    meter_number: Joi.string().required(),
    country_code : Joi.string().required(),
    amount : Joi.number().required().min(0),
});
