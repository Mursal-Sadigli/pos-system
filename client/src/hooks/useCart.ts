import {useCartStore} from '@/store/cartStore';

export function useCart(){
    const {
        items, subtotal, tax, discount, total, addItem, removeItem, updateQuantity, clearCart, setDiscount, } = useCartStore();

        return {
            items,
            subtotal,
            tax,
            discount,
            total,
            isEmpty: items.length===0,
            itemCount: items.reduce((sum, item) => sum+item.quantity, 0),
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            setDiscount,
        };
    }