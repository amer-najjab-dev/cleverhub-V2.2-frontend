// ============================================
// TIPOS PARA CIERRE DE CAJA
// ============================================

export interface CashClosure {
  id: string;
  date: string;
  user: {
    id: number;
    fullName: string;
  };
  fiscalData: FiscalData;
  sales: SalesSummary;
  payments: PaymentSummary;
  cashAudit: CashAudit;
  createdAt: string;
}

export interface FiscalData {
  companyName: string;
  if: string;        // Identifiant Fiscal
  ice: string;       // Identifiant Commercial
  rc: string;        // Registre de Commerce
  cnss: string;      // CNSS
  address: string;
  city: string;
}

export interface SalesSummary {
  grossSales: number;           // Ventas brutas (PPV)
  vatBreakdown: VatBreakdown;   // Desglose de IVA
  netSales: number;             // Ventas netas
  discountTotal: number;        // Total descuentos
  returnsTotal: number;         // Total devoluciones
}

export interface VatBreakdown {
  vat7: number;      // 7% - Alimentos, libros
  vat10: number;     // 10% - Medicamentos, transporte
  vat14: number;     // 14% - Hoteles, restaurantes
  vat20: number;     // 20% - General
  vatExempt: number; // Exento
}

export interface PaymentSummary {
  cash: number;           // Espèces
  card: number;           // TPE / Carte bancaire
  transfer: number;       // Virement
  check: number;          // Chèque
  credit: number;         // Crédit fournisseur
  mixed: number;          // Paiements mixtes
}

export interface CashAudit {
  initialFund: number;        // Fondo inicial
  expectedCash: number;       // Efectivo esperado (según sistema)
  actualCash: number;         // Efectivo real (conteo)
  discrepancy: number;        // Diferencia (actual - expected)
  manualEntries: ManualEntry[];
  safeDrop: number;           // Retiro a caja fuerte
}

export interface ManualEntry {
  id: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  user: string;
  timestamp: string;
}

// ============================================
// TIPOS PARA ANÁLISIS DE PROVEEDORES
// ============================================

export interface SupplierPurchaseAnalysis {
  supplierId: string;
  supplierName: string;
  period: string;
  totals: {
    invoiced: number;         // Total facturado
    paid: number;             // Total pagado
    pending: number;          // Saldo pendiente
    deliveryNotes: number;    // Número de BLs
    creditNotes: CreditNoteSummary[];
  };
  marginAnalysis: MarginAnalysis;
  productPerformance: ProductPerformance[];
}

export interface CreditNoteSummary {
  id: string;
  reference: string;
  date: string;
  amount: number;
  usedAmount: number;
  reason: 'return' | 'breakage' | 'price_difference';
  remaining: number;
}

export interface MarginAnalysis {
  totalCost: number;      // PPH total
  totalRevenue: number;   // PPV total
  grossMargin: number;    // Beneficio bruto
  marginPercentage: number;
  averageMargin: number;
  bestMarginProduct: {
    name: string;
    margin: number;
  };
  worstMarginProduct: {
    name: string;
    margin: number;
  };
}

export interface ProductPerformance {
  productId: number;
  productName: string;
  quantity: number;
  costPPH: number;
  revenuePPV: number;
  margin: number;
  marginPercentage: number;
}

// ============================================
// TIPOS PARA BUSINESS INTELLIGENCE
// ============================================

export interface DashboardKPIs {
  totalStockValue: number;      // Valor total del stock (PPH)
  averageMargin: number;        // Margen promedio del mes
  expiringPercentage: number;   // % productos próximos a caducar
  totalSales: number;           // Ventas totales del período
  salesGrowth: number;          // Crecimiento vs período anterior
  lowStockCount: number;        // Productos con stock bajo
  pendingOrders: number;        // Pedidos pendientes
}

export interface SalesTrend {
  date: string;
  actual: number;
  previous: number;
}

export interface TopProduct {
  id: number;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  margin: number;
  marginPercentage: number;
}

export interface LostSale {
  id: string;
  date: string;
  productId: number;
  productName: string;
  quantity: number;
  clientName?: string;
  clientPhone?: string;
  reason?: string;
}

// ============================================
// TIPOS PARA TRAZABILIDAD DE LOTES
// ============================================

export interface BatchTracking {
  batchNumber: string;
  productId: number;
  productName: string;
  expiryDate: string;
  quantity: number;
  transactions: BatchTransaction[];
}

export interface BatchTransaction {
  id: string;
  date: string;
  type: 'in' | 'out';
  quantity: number;
  clientId?: number;
  clientName?: string;
  prescriptionId?: string;
}

// ============================================
// TIPOS PARA LOG DE AUDITORÍA
// ============================================

export interface AuditLogEntry {
  id: string;
  userId: number;
  userName: string;
  action: 'export' | 'modify' | 'validate' | 'view';
  module: 'cash' | 'supplier' | 'bi' | 'batch';
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// ============================================
// TIPOS PARA FILTROS Y PETICIONES
// ============================================

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ReportFilters extends DateRange {
  supplierId?: string;
  categoryId?: number;
  productId?: number;
  userId?: number;
}

export interface SupplierReportFilters extends DateRange {
  supplierIds?: string[];  // Para comparar múltiples proveedores
  includeCreditNotes?: boolean;
  groupBy?: 'day' | 'week' | 'month';
}

// ============================================
// TIPOS PARA RESPUESTAS DE API
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  message?: string;
}
