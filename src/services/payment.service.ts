import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config';
import { TBikashPayment, TBikashResponse, TPaymentVerification } from '../types/TOrder';

// Bikash API configuration
const BIKASH_CONFIG = {
    baseURL: process.env.BIKASH_API_URL || 'https://api.bikash.com',
    username: process.env.BIKASH_USERNAME,
    password: process.env.BIKASH_PASSWORD,
    appKey: process.env.BIKASH_APP_KEY,
    appSecret: process.env.BIKASH_APP_SECRET
};

// Generate Bikash signature
const generateSignature = (data: string): string => {
    return crypto
        .createHmac('sha256', BIKASH_CONFIG.appSecret!)
        .update(data)
        .digest('hex');
};

// Create payment request
export const createBikashPayment = async (paymentData: TBikashPayment): Promise<TBikashResponse> => {
    try {
        const timestamp = Date.now().toString();
        const payload = {
            amount: paymentData.amount,
            currency: 'BDT',
            intent: 'sale',
            merchantInvoiceNumber: paymentData.orderId,
            callbackURL: `${process.env.BACKEND_URL}/api/payments/bikash/callback`,
            payerReference: paymentData.phone,
            appKey: BIKASH_CONFIG.appKey,
            timestamp
        };

        const signature = generateSignature(JSON.stringify(payload));

        const response = await axios.post(`${BIKASH_CONFIG.baseURL}/v1.2.0-beta/checkout/create`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-app-key': BIKASH_CONFIG.appKey,
                'x-app-secret': BIKASH_CONFIG.appSecret,
                'x-signature': signature
            }
        });

        if (response.data.statusCode === '0000') {
            return {
                success: true,
                transactionId: response.data.bkashTrxID,
                message: 'Payment initiated successfully',
                paymentUrl: response.data.bkashURL
            };
        }

        return {
            success: false,
            message: response.data.statusMessage || 'Payment initiation failed'
        };

    } catch (error) {
        console.error('Bikash payment error:', error);
        return {
            success: false,
            message: 'Payment service temporarily unavailable'
        };
    }
};

// Verify payment
export const verifyBikashPayment = async (verificationData: TPaymentVerification): Promise<TBikashResponse> => {
    try {
        const timestamp = Date.now().toString();
        const payload = {
            trxID: verificationData.transactionId,
            appKey: BIKASH_CONFIG.appKey,
            timestamp
        };

        const signature = generateSignature(JSON.stringify(payload));

        const response = await axios.post(`${BIKASH_CONFIG.baseURL}/v1.2.0-beta/checkout/execute`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-app-key': BIKASH_CONFIG.appKey,
                'x-app-secret': BIKASH_CONFIG.appSecret,
                'x-signature': signature
            }
        });

        if (response.data.statusCode === '0000') {
            return {
                success: true,
                transactionId: response.data.bkashTrxID,
                message: 'Payment verified successfully'
            };
        }

        return {
            success: false,
            message: response.data.statusMessage || 'Payment verification failed'
        };

    } catch (error) {
        console.error('Bikash verification error:', error);
        return {
            success: false,
            message: 'Payment verification service temporarily unavailable'
        };
    }
};

// Refund payment
export const refundBikashPayment = async (transactionId: string, amount: number, reason: string): Promise<TBikashResponse> => {
    try {
        const timestamp = Date.now().toString();
        const payload = {
            originalTrxID: transactionId,
            amount: amount,
            reason: reason,
            appKey: BIKASH_CONFIG.appKey,
            timestamp
        };

        const signature = generateSignature(JSON.stringify(payload));

        const response = await axios.post(`${BIKASH_CONFIG.baseURL}/v1.2.0-beta/checkout/refund`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-app-key': BIKASH_CONFIG.appKey,
                'x-app-secret': BIKASH_CONFIG.appSecret,
                'x-signature': signature
            }
        });

        if (response.data.statusCode === '0000') {
            return {
                success: true,
                transactionId: response.data.bkashTrxID,
                message: 'Refund processed successfully'
            };
        }

        return {
            success: false,
            message: response.data.statusMessage || 'Refund failed'
        };

    } catch (error) {
        console.error('Bikash refund error:', error);
        return {
            success: false,
            message: 'Refund service temporarily unavailable'
        };
    }
}; 