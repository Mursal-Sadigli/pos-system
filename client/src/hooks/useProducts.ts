import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {productApi} from '../lib/api';
import type {CreateProductRequest, Product} from '@/types/product';

export function useProducts(){
    return useQuery<Product[], Error>({
        queryKey: ['products'],
        queryFn: async() => {
            const response=await productApi.getProducts();
            return response.data;
        },
    });
}

export function useCreateProduct(){
    const queryClient=useQueryClient();
    return useMutation({
        mutationFn: async(payload: CreateProductRequest) => {
            const response = await productApi.createProduct(payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}