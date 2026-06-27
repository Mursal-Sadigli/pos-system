import {z} from 'zod';

export const loginSchema=z.object({
    email: z.string().email('Email düzgün deyil'),
    password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır'),
});

export const productSchema=z.object({
    name: z.string().min(1, 'Məhsul adı lazımdır'),
    sku: z.string().min(1, 'SKU lazımdır'),
    categoryId: z.string().min(1, 'Kateqoriya lazımdır'),
    price: z.number().nonnegative('Qiymət mənfi ola bilməz'),
    cost: z.number().nonnegative('Məbləğ mənfi ola bilməz'),
    stock: z.number().nonnegative('Stok mənfi ola bilməz'),
    unit: z.enum(['piece', 'kg', 'gram', 'liter', 'meter']),
    description: z.string().optional(),
    barcode: z.string().optional(),
    taxrate: z.number().optional(),
    minStock: z.number().optional(),
});

export const orderSchema=z.object({
    customerId: z.string().min(1, 'Müştəri seçilməlidir'),
    items: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
            price: z.number().nonnegative(),
        })
    ),
    discount: z.number().nonnegative().optional(),
    taxRate: z.number().nonnegative().optional(),
});