import { api } from '../../../services/api';

export interface CashClosureData {
  id: string;
  date: string;
  user: {
    id: number;
    fullName: string;
  };
  fiscalData: {
    companyName: string;
    if: string;
    ice: string;
    rc: string;
    cnss: string;
    address: string;
    city: string;
  };
  sales: {
    grossSales: number;
    vatBreakdown: any;
    netSales: number;
    discountTotal: number;
    returnsTotal: number;
    margin: {
      total: number;
      percentage: number;
    };
  };
  payments: {
    cash: number;
    card: number;
    transfer: number;
    check: number;
    credit: number;
  };
  cashAudit: {
    initialFund: number;
    expectedCash: number;
    actualCash: number;
    discrepancy: number;
    manualEntries: any[];
    safeDrop: number;
  };
  topProducts: Array<{
    productId: number;
    productName: string;
    quantity: number;
    revenue: number;
    margin: number;
  }>;
  createdAt: string;
}

export interface DashboardKPIs {
  totalStockValue: number;
  averageMargin: number;
  expiringPercentage: number;
  totalSales: number;
  salesGrowth: number;
  lowStockCount: number;
  pendingOrders: number;
}

export interface SalesTrendItem {
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

export interface SupplierPurchaseAnalysis {
  supplierId: string;
  supplierName: string;
  totals?: {
    invoiced: number;
    paid: number;
  };
}

export const reportService = {
  getCashClosure: async (date: string): Promise<CashClosureData> => {
    const response = await api.get('/reports/cash-closure', { params: { date } });
    return response.data.data;
  },

  getDailyClosure: async (date: string): Promise<CashClosureData> => {
    const response = await api.get('/reports/cash-closure', { params: { date } });
    return response.data.data;
  },

  validateClosure: async (data: any) => {
    const response = await api.post('/reports/cash-closure/validate', data);
    return response.data;
  },

  resolveDiscrepancy: async (data: any) => {
    const response = await api.post('/reports/cash-closure/resolve', data);
    return response.data;
  },

  getDashboardKPIs: async (period: string): Promise<DashboardKPIs> => {
    const response = await api.get('/reports/dashboard/kpis', { params: { period } });
    return response.data.data;
  },

  getSalesTrend: async (period: string): Promise<SalesTrendItem[]> => {
    const response = await api.get('/reports/dashboard/sales-trend', { params: { period } });
    return response.data.data;
  },

  getTopProducts: async (limit: number, period: string): Promise<TopProduct[]> => {
    const response = await api.get('/reports/dashboard/top-products', { params: { limit, period } });
    return response.data.data;
  },

  getLostSales: async (period: string): Promise<any[]> => {
    const response = await api.get('/reports/dashboard/lost-sales', { params: { period } });
    return response.data.data;
  },

  getSupplierAnalysis: async (filters: any): Promise<SupplierPurchaseAnalysis[]> => {
    const response = await api.get('/reports/suppliers/analysis', { params: filters });
    return response.data.data;
  },

  getSupplierPurchaseHistory: async (supplierId: string, months: number) => {
    const response = await api.get(`/reports/suppliers/${supplierId}/purchases`, { params: { months } });
    return response.data.data;
  },

  getSupplierCreditNotes: async (supplierId: string, status?: string) => {
    const response = await api.get(`/reports/suppliers/${supplierId}/credit-notes`, { params: { status } });
    return response.data.data;
  },
};