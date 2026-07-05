export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'completed';

export interface OrderItem{
    productId: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Order{
    id: string;
    order_number?: string;
    source?: string;
    storeId: string;
    customerId: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOrderRequest{
    storeId: string;
    customerId: string;
    items: Omit<OrderItem, 'total'>[];
    discount?: number;
    taxRate?: number;
}
