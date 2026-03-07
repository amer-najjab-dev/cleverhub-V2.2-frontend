import { api } from './api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  pricePPV: number;
  pricePPH: number;
  stock: number;
  category: string;
  category_id?: number;
  sku?: string;
  expirationDate?: Date;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  dosageForm?: string;
  barcode?: string;
  zone?: string;
  active: boolean;
  laboratory?: string;
  prescription: boolean;
  posologyAdult?: string;
  posologyChild?: string;
  contraindications?: string;
  monograph?: string;
  priceHistories?: PriceHistory[];
  inventoryLots?: InventoryLot[];
  stockMovements?: StockMovement[];
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface PriceHistory {
  id: number;
  date: string;
  pricePPV: number;
  pricePPH: number;
}

export interface InventoryLot {
  id: number;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  type: 'vente' | 'achat' | 'retour' | 'ajustement';
  quantity: number;
  stockAfter: number;
  notes?: string;
  createdAt: string;
  lot?: InventoryLot;
}

export const productsService = {
  // Obtener todos los productos
  getAll: (params?: ProductSearchParams) => 
    api.get<Product[]>('/products', { params }), // Cambiado de '/productos' a '/products'

  // Obtener producto por ID
  getById: (id: number) => 
    api.get<Product>(`/products/${id}`), // Cambiado

  // Buscar productos
  search: (query: string) => 
    api.get<Product[]>(`/products/search?q=${query}`), // Cambiado

  // Crear producto
  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Product>('/products', data), // Cambiado

  // Actualizar producto
  update: (id: number, data: Partial<Product>) => 
    api.put<Product>(`/products/${id}`, data), // Cambiado

  // Actualizar stock
  updateStock: (id: number, stockChange: number) => 
    api.patch(`/products/${id}/stock`, { stock: stockChange }), // Cambiado

  // Eliminar producto
  delete: (id: number) => 
    api.delete(`/products/${id}`), // Cambiado

  // Obtener productos por categoría
  getByCategory: (categoryId: number) => 
    api.get<Product[]>(`/products/category/${categoryId}`), // Cambiado
};
