import Joi from "joi";
export const verifyAndUpdateBankAccount = Joi.object().keys({
        account_bank : Joi.string().required(),
        account_number : Joi.string().required().min(10).max(10),
        bank_name : Joi.string().required(),
});
