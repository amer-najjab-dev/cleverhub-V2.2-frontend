export interface Supplier {
  id: string;
  companyName: string;
  email?: string;
  website?: string;
  fax?: string;
  paymentTerms?: string;
  taxId?: string;
  registrationNumber?: string;
  balance: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relaciones
  phones?: SupplierPhone[];
  addresses?: SupplierAddress[];  // Cambiado de address a addresses
  contacts?: SupplierContact[];
}

export interface SupplierPhone {
  id: string;
  supplierId: string;
  number: string;
  type: 'order' | 'accounting' | 'delivery' | 'other';
  description?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface SupplierAddress {
  id: string;
  supplierId: string;
  streetNumber?: string;
  streetName: string;
  city: string;
  postalCode?: string;
  country: string;
  complement?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface SupplierContact {
  id: string;
  supplierId: string;
  firstName: string;
  lastName: string;
  position?: string;
  email?: string;
  isPrimary: boolean;
  phones?: ContactPhone[];
  createdAt: string;
}

export interface ContactPhone {
  id: string;
  contactId: string;
  number: string;
  type: 'mobile' | 'work' | 'other';
  isPrimary: boolean;
}

export interface CreditNote {
  id: string;
  supplierId: string;
  reference: string;
  issueDate: string;
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'used' | 'expired';
  reason: 'return' | 'breakage' | 'price_difference' | 'other';
  linkedBL?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryNote {
  id: string;
  supplierId: string;
  blNumber: string;
  blDate: string;
  createdAt: string;
  total: number;
  status: 'pending' | 'received' | 'partial' | 'cancelled';
  purchaseOrderId?: string;
  receivedBy?: number;
  receivedAt?: string;
  notes?: string;
  items?: DeliveryNoteItem[];
}

export interface DeliveryNoteItem {
  id: string;
  deliveryNoteId: string;
  productId: number;
  productName?: string;
  quantity: number;
  pricePPH: number;
  systemPricePPH: number;
  batchNumber?: string;
  expiryDate?: string;
  isDamaged: boolean;
  notes?: string;
}

export interface ProductPurchase {
  id: string;
  supplierId: string;
  productId: number;
  productName?: string;
  supplierName?: string;
  purchaseDate: string;
  quantity: number;
  pricePPH: number;
  previousPPH?: number;
  batchNumber?: string;
  expiryDate?: string;
  deliveryNoteId?: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  date: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'check' | 'credit_note';
  creditNoteId?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  orderNumber: string;
  orderDate: string;
  expectedDate?: string;
  total: number;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: PurchaseOrderItem[];
}

// AÑADIDO: interfaz PurchaseOrderItem que faltaba
export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: number;
  quantity: number;
  pricePPH: number;
  receivedQuantity: number;
  productName?: string;
}