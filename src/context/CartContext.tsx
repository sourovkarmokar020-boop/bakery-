import { createContext, useContext, useState, ReactNode } from "react";
import { trackAddToCart } from "@/components/TrackingManager";

export interface Product {
  id: string | number;
  name: string;
  name_en?: string;
  name_bn?: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  category: string;
  rating: number;
  brand: string;
  code: string;
  description: string;
  description_en?: string;
  description_bn?: string;
  short_description?: string;
  short_description_en?: string;
  short_description_bn?: string;
  weight?: string;
  weight_en?: string;
  weight_bn?: string;
  unit?: string;
  unit_en?: string;
  unit_bn?: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity = 1) => {
    if (!product.inStock) {
      return; // Don't add out of stock products
    }
    setItems((prev) => {
      const existing = prev.find((i) => String(i.product.id) === String(product.id));
      const newQuantity = existing ? existing.quantity + quantity : quantity;
      // Track add to cart event
      trackAddToCart({
        product_id: String(product.id),
        product_name: product.name,
        price: product.price,
        quantity: newQuantity,
      });
      
      if (existing) {
        return prev.map((i) =>
          String(i.product.id) === String(product.id)
            ? { ...i, quantity: newQuantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string | number) => {
    setItems((prev) => prev.filter((i) => String(i.product.id) !== String(productId)));
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setItems((prev) =>
      prev.map((i) => (String(i.product.id) === String(productId) ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
