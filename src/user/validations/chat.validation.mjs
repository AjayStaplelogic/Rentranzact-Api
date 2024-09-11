import Joi from "joi";
export const joinChatRoom = Joi.object().keys({
    user_id: Joi.string().required(),
    chat_with: Joi.string().required(),
    is_admin: Joi.boolean().required(),
    admin_id: Joi.alternatives().conditional('is_admin', {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.optional()
    }),
});
