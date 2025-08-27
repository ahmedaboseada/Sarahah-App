import joi from "joi";

export const sendMessageSchema = {
    body: joi.object({
        message: joi.string().required().min(1).max(255).messages({
            'string.empty': 'Message is required',
            'string.min': 'Message must be at least 1 character long',
            'string.max': 'Message must be at most 255 characters long',
        }),
    }),
    params: joi.object({
        id: joi.string().required().hex().length(24).messages({
            'string.empty': 'User ID is required',
            'string.length': 'User ID must be 24 characters long',
            'string.hex': 'User ID must be a valid hex string',
        }),
    })
}

export const getMessageSchema = {
    params: joi.object({
        id: joi.string().required().hex().length(24).messages({
            'string.empty': 'Message ID is required',
            'string.length': 'Message ID must be 24 characters long',
            'string.hex': 'Message ID must be a valid hex string',
        }),
    })
}

export const getAllMessagesSchema = {
    params: joi.object({
        id: joi.string().required().hex().length(24).messages({
            'string.empty': 'User ID is required',
            'string.length': 'User ID must be 24 characters long',
            'string.hex': 'User ID must be a valid hex string',
        }),
    })
}
