import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import type { CreateOrderRequest, Order } from '@/types/order';

export function useOrders() {
  return useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await orderApi.getOrders();
      return response.data;
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateOrderRequest) => {
      const response = await orderApi.createOrder(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
}