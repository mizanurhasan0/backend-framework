export interface TShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
}

export interface TCreateOrder {
    shippingAddress: TShippingAddress;
    paymentMethod: 'bikash' | 'cash_on_delivery' | 'bank_transfer';
    notes?: string;
}

export interface TOrderResponse {
    id: string;
    orderNumber: string;
    items: Array<{
        id: string;
        product: {
            id: string;
            name: string;
            price: number;
            image?: string;
        };
        quantity: number;
        price: number;
        variant?: string;
        total: number;
    }>;
    shippingAddress: TShippingAddress;
    paymentDetails: {
        method: string;
        transactionId?: string;
        amount: number;
        status: string;
        paidAt?: Date;
    };
    subtotal: number;
    tax: number;
    shippingCost: number;
    totalAmount: number;
    status: string;
    notes?: string;
    createdAt: Date;
}

export interface TBikashPayment {
    amount: number;
    phone: string;
    orderId: string;
}

export interface TBikashResponse {
    success: boolean;
    transactionId?: string;
    message: string;
    paymentUrl?: string;
}

export interface TPaymentVerification {
    transactionId: string;
    orderId: string;
}

export interface TOrderStatus {
    orderId: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
} 