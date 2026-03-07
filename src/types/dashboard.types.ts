export interface DashboardKPI {
  todaySales: number;
  weekSales: number;
  averageTicket: number;
  lowStockCount: number;
  growth: number;
  totalSales?: number;
  totalProfit?: number;
  averageMargin?: number;
  pendingOrders?: number;
}

export interface HourlySale {
  hour: string;
  value: number;
}

export interface ComparativeData {
  day: string;
  actual: number;
  previous: number;
}

export interface TopProduct {
  id: number;
  name: string;
  category: string;
  sales: number;
  change: number;
  revenue?: number;
}

export interface QuickSummary {
  bestHour: {
    hour: string;
    value: number;
  };
  topProduct: {
    name: string;
    sales: number;
  };
  topCustomer: {
    name: string;
    total: number;
  };
}
