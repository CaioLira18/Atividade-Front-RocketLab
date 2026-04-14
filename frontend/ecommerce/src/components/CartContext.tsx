import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem, Produto } from '../types';


interface CartContextData {
  cart: CartItem[];
  addToCart: (produto: Produto) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItens: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('@RocketLab:cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('@RocketLab:cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (produto: Produto) => {
    setCart(prev => {
      const exists = prev.find(item => item.id_produto === produto.id_produto);
      if (exists) {
        return prev.map(item => 
          item.id_produto === produto.id_produto 
            ? { ...item, quantidade: item.quantidade + 1 } 
            : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id_produto !== id));
  };

  const clearCart = () => setCart([]);

  const totalItens = cart.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItens }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);