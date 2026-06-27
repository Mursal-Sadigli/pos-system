export interface Customer{
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    loyaltyPoints: number;
    storeId: string;
    createdAt: Date;
    updatedAt: Date;
}