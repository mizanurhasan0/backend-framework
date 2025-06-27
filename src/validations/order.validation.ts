import Joi from 'joi';

export const shippingAddressSchema = Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 100 characters',
        'any.required': 'Name is required'
    }),
    phone: Joi.string().required().pattern(/^(\+880|880|0)?1[3-9]\d{8}$/).messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please enter a valid Bangladeshi phone number',
        'any.required': 'Phone number is required'
    }),
    address: Joi.string().required().min(10).max(200).messages({
        'string.empty': 'Address is required',
        'string.min': 'Address must be at least 10 characters',
        'string.max': 'Address must not exceed 200 characters',
        'any.required': 'Address is required'
    }),
    city: Joi.string().required().min(2).max(50).messages({
        'string.empty': 'City is required',
        'string.min': 'City must be at least 2 characters',
        'string.max': 'City must not exceed 50 characters',
        'any.required': 'City is required'
    }),
    postalCode: Joi.string().required().pattern(/^\d{4}$/).messages({
        'string.empty': 'Postal code is required',
        'string.pattern.base': 'Postal code must be 4 digits',
        'any.required': 'Postal code is required'
    }),
    country: Joi.string().default('Bangladesh').messages({
        'string.base': 'Country must be a string'
    })
});

export const createOrderSchema = Joi.object({
    shippingAddress: shippingAddressSchema.required().messages({
        'any.required': 'Shipping address is required'
    }),
    paymentMethod: Joi.string().valid('bikash', 'cash_on_delivery', 'bank_transfer').required().messages({
        'string.empty': 'Payment method is required',
        'any.only': 'Payment method must be bikash, cash_on_delivery, or bank_transfer',
        'any.required': 'Payment method is required'
    }),
    notes: Joi.string().optional().max(500).messages({
        'string.max': 'Notes must not exceed 500 characters'
    })
});

export const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').required().messages({
        'string.empty': 'Status is required',
        'any.only': 'Status must be pending, confirmed, processing, shipped, delivered, or cancelled',
        'any.required': 'Status is required'
    })
});

export const bikashPaymentSchema = Joi.object({
    phone: Joi.string().required().pattern(/^(\+880|880|0)?1[3-9]\d{8}$/).messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please enter a valid Bangladeshi phone number',
        'any.required': 'Phone number is required'
    })
});

export const verifyPaymentSchema = Joi.object({
    transactionId: Joi.string().required().min(10).max(50).messages({
        'string.empty': 'Transaction ID is required',
        'string.min': 'Transaction ID must be at least 10 characters',
        'string.max': 'Transaction ID must not exceed 50 characters',
        'any.required': 'Transaction ID is required'
    })
}); 