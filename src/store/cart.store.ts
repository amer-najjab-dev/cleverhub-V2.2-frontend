import { create } from 'zustand';

// Usar interface que funciona mejor con verbatimModuleSyntax
export interface CartItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  pricePPV: number;      // Precio Público de Venta
  pricePPH: number;      // Precio de Compra/Proveedor
  quantity: number;
  discountPercentage: number;  // Descuento por producto (0-100%)
  hasInteraction?: boolean;
  lowStock?: boolean;
  interactionWarning?: string;
   isLoyalty?: boolean;
  loyaltyType?: 'reward' | 'pack';
  loyaltyId?: number;
  packId?: number;
  points?: number;
}

interface CartStore {
  items: CartItem[];
  clientId?: number;  // CAMBIADO: Ahora es opcional
  discountType: 'none' | 'percentage' | 'amount';  // Descuento por carrito
  discountValue: number;  // Valor del descuento por carrito
  paymentMethod?: 'efectivo' | 'tarjeta' | 'credito' | 'transferencia' | 'cheque' | 'mixto' | 'puntos';
  
  // NUEVO: Estado para pago mixto
  mixedPayments?: {
    firstMethod?: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' | 'cheque' | 'puntos';
    firstAmount?: number;
    secondMethod?: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' | 'cheque' | 'puntos';
    secondAmount?: number;
    step?: 'selecting_first' | 'selecting_second' | 'completed';
  };
  
  addItem: (item: Omit<CartItem, 'quantity' | 'discountPercentage'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateProductDiscount: (id: number, percentage: number) => void;
  updateCartDiscount: (type: 'none' | 'percentage' | 'amount', value: number) => void;
  setPaymentMethod: (method: 'efectivo' | 'tarjeta' | 'credito' | 'transferencia' | 'cheque' | 'mixto'| 'puntos') => void;
  
  // NUEVO: Funciones para manejar pago mixto
  setMixedPayment: (data: Partial<CartStore['mixedPayments']>) => void;
  clearMixedPayment: () => void;
  
  setClient: (clientId: number | undefined) => void;  // CAMBIADO: Ahora acepta undefined
  clearClient: () => void;  // NUEVO: Función para limpiar cliente
  clearCart: () => void;
  
  getSubtotal: () => number;
  getSubtotalWithProductDiscounts: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: (region?: string) => number;  // AHORA RECIBE REGIÓN
  getTotal: (region?: string) => number;      // AHORA RECIBE REGIÓN
  getTotalCost: () => number;
  getTotalMargin: () => number;
  hasProductDiscounts: () => boolean;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  clientId: undefined,  // CAMBIADO: De 1 a undefined
  discountType: 'none',
  discountValue: 0,
  paymentMethod: undefined,
  mixedPayments: undefined,

  addItem: (item) => set((state) => {
    const existingItem = state.items.find(i => i.id === item.id);
    
    if (existingItem) {
      return {
        items: state.items.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      };
    } else {
      return {
        items: [...state.items, { ...item, quantity: 1, discountPercentage: 0 }]
      };
    }
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    )
  })),

  updateProductDiscount: (id, percentage) => set((state) => ({
    items: state.items.map(item => 
      item.id === id 
        ? { ...item, discountPercentage: Math.max(0, Math.min(100, percentage)) }
        : item
    ),
    discountType: percentage > 0 ? 'none' : state.discountType,
    discountValue: percentage > 0 ? 0 : state.discountValue
  })),

  updateCartDiscount: (type, value) => set((state) => {
    const hasProductDiscounts = state.items.some(item => item.discountPercentage > 0);
    if (hasProductDiscounts && type !== 'none') {
      console.warn('No se puede aplicar descuento por carrito cuando hay descuentos por producto');
      return state;
    }
    
    return {
      discountType: type,
      discountValue: value
    };
  }),

  setPaymentMethod: (method) => set((_state) => {
    if (method === 'mixto') {
      return {
        paymentMethod: method,
        mixedPayments: {
          step: 'selecting_first'
        }
      };
    } else {
      return {
        paymentMethod: method,
        mixedPayments: undefined
      };
    }
  }),

  setMixedPayment: (data) => set((state) => ({
    mixedPayments: {
      ...state.mixedPayments,
      ...data
    }
  })),

  clearMixedPayment: () => set(() => ({
    mixedPayments: undefined
  })),

  setClient: (clientId) => set(() => ({
    clientId
  })),

  clearClient: () => set(() => ({
    clientId: undefined
  })),

  clearCart: () => set(() => ({
    items: [],
    clientId: undefined,
    discountType: 'none',
    discountValue: 0,
    paymentMethod: undefined,
    mixedPayments: undefined
  })),

  getSubtotal: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + (item.pricePPV * item.quantity), 0);
  },

  getSubtotalWithProductDiscounts: () => {
    const state = get();
    return state.items.reduce((sum, item) => {
      const itemTotal = item.pricePPV * item.quantity;
      const discountAmount = itemTotal * (item.discountPercentage / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);
  },
  
  getTotalCost: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + (item.pricePPH * item.quantity), 0);
  },
  
  getTotalMargin: () => {
    const state = get();
    const subtotal = state.getSubtotalWithProductDiscounts();
    const totalCost = state.getTotalCost();
    return subtotal - totalCost;
  },
  
  getDiscountAmount: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    const subtotalWithProductDiscounts = state.getSubtotalWithProductDiscounts();
    const productDiscounts = subtotal - subtotalWithProductDiscounts;
    
    if (productDiscounts > 0) {
      return productDiscounts;
    }
    
    if (state.discountType === 'percentage') {
      return subtotal * (state.discountValue / 100);
    } else if (state.discountType === 'amount') {
      return state.discountValue;
    }
    return 0;
  },
  
  // NUEVA FUNCIÓN: Calcula IVA según región
  getTaxAmount: (region: string = 'MA') => {
    const state = get();
    const subtotal = state.getSubtotalWithProductDiscounts();
    const discount = state.getDiscountAmount();
    const taxable = subtotal - discount;
    
    // Tasas de IVA por región
    const taxRates: Record<string, number> = {
      'MA': 0,    // Marruecos: IVA incluido
      'FR': 0.20, // Francia: 20%
      'ES': 0.21, // España: 21%
      'TN': 0.19, // Túnez: 19%
      'DZ': 0.19, // Argelia: 19%
      'NA': 0.20, // Norte de África (genérico): 20%
    };
    
    const rate = taxRates[region] || 0;
    return taxable * rate;
  },
  
  // MODIFICADO: Usa getTaxAmount con región
  getTotal: (region: string = 'MA') => {
    const state = get();
    const subtotal = state.getSubtotalWithProductDiscounts();
    const discount = state.getDiscountAmount();
    const tax = state.getTaxAmount(region);
    return subtotal - discount + tax;
  },

  hasProductDiscounts: () => {
    const state = get();
    return state.items.some(item => item.discountPercentage > 0);
  },
}));