import Joi from 'joi';

export const addToCartSchema = Joi.object({
    productId: Joi.string().required().messages({
        'string.empty': 'Product ID is required',
        'any.required': 'Product ID is required'
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required'
    }),
    variant: Joi.string().optional().allow(null, '').messages({
        'string.base': 'Variant must be a string'
    })
});

export const updateCartItemSchema = Joi.object({
    itemId: Joi.string().required().messages({
        'string.empty': 'Item ID is required',
        'any.required': 'Item ID is required'
    }),
    quantity: Joi.number().integer().min(0).required().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 0',
        'any.required': 'Quantity is required'
    })
});

export const removeFromCartSchema = Joi.object({
    itemId: Joi.string().required().messages({
        'string.empty': 'Item ID is required',
        'any.required': 'Item ID is required'
    })
}); 