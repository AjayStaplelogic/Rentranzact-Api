import Joi from "joi";

export const subscribeNewLetter = Joi.object().keys({
        email : Joi.string().required().email(),
});
