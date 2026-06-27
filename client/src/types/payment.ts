export type PaymentMethod='cash' | 'card' | 'wallet' | 'online';

export interface Payment{
    id: string;
    orderId: string;
    amount: number;
    method: PaymentMethod;
    status: 'pending' | 'paid' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentRequest{
    orderId: string;
    amount: number;
    method: PaymentMethod;
}