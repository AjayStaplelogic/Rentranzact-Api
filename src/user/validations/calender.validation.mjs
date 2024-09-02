import Joi from "joi";

export const blockMultipleTimeSlots = Joi.object().keys({
    slots: Joi.array().items({
        id: Joi.string().optional().valid(
            "",
            "morning-1",
            "morning-2",
            "morning-3",
            "afternoon-1",
            "afternoon-2",
            "afternoon-3",
            "afternoon-4",
            "evening-1",
            "evening-2",
            "evening-3",
            "evening-4"
        ),
        date : Joi.string().required(),
        time : Joi.string().optional().allow(""),
        fullDay : Joi.boolean().optional(),
        _id : Joi.string().optional().allow("", null),
    }).required(),
    slots_to_delete : Joi.array().items(Joi.string().optional()).optional()
});
