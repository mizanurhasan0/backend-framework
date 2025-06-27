export interface TCartItem {
    productId: string;
    quantity: number;
    variant?: string;
}

export interface TCartResponse {
    id: string;
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
    totalAmount: number;
    totalItems: number;
}

export interface TAddToCart {
    productId: string;
    quantity: number;
    variant?: string;
}

export interface TUpdateCartItem {
    itemId: string;
    quantity: number;
}

export interface TCartSummary {
    totalItems: number;
    totalAmount: number;
    itemCount: number;
} 