import Joi from "joi";
export const addCard = Joi.object().keys({
        card_token : Joi.string().required(),
        gateway_type : Joi.string().required().valid("stripe", "flutterwave", "paystack")
});
