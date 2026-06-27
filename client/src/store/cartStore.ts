import {create} from 'zustand';
import {persist} from 'zustand/middleware';

interface CartItem{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;   
}

interface CartStore{
    items: CartItem[];
    subtotal: number;
    tax: number;
    discount: number;
    addItem: (product: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    setDiscount: (amount: number) => void;
}

export const useCartStore = create<CartStore>(){
    persist(
        (set, get) => ({
            items: [],
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0,

            addItem: (product) => {
                const {items} = get();
                const existingItem=items.find((item) => item.id === product.id);
                
                if(existingItem){
                    set({
                        items: items.map((item) => 
                        item.id === product.id
                    ? { ...item, quantity: item.quantity + 1}
                :item
            ),
        });
    }else{
        set({items: [...items, { ...product, quantity: 1}] });
    }

    // Recalculate subtotal, tax, and total
    get()._recalculateTotals();
},

removeItem: (id) => {
    set({items: get().items.filter((item) => item.id !== id) });
    get()._recalculateTotals();
},

updateQuantity: (id, delta) => {
    const {items} = get();
    const item=items.find((i) => i.id===id);
    if(!item) return;

    const newQuantity=item.quantity+delta;
    if(newQuantity <= 0){
        get().removeItem(id);
        return;
    }

    set({
        items: items.map((i) => 
        i.id===id ? { ...i, quantity: newQuantity} : i
        ),
    });
    get()._recalculateTotals();
},

setDiscount: (amount) => {
    set({discount: amount});
    const subtotal=items.reduce((sum, item) => sum+item.price*item.quantity, 0);
    const tax=subtotal*0.1; // 10% tax
    const total=subtotal+tax-discount;

    set({subtotal, tax, total});
},
        });
        {
            name: 'cart-storage',
        }
    )
};