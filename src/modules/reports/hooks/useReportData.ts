import { useState, useEffect } from 'react';
import { reportService } from '../services/report.service';
import { 
  CashClosure, 
  DashboardKPIs, 
  SalesTrend, 
  TopProduct, 
  LostSale,
  SupplierPurchaseAnalysis 
} from '../types/report.types';

export const useCashClosure = (date: Date) => {
  const [data, setData] = useState<CashClosure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClosure();
  }, [date]);

  const loadClosure = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportService.getDailyClosure(date);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el cierre de caja');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: loadClosure };
};

export const useDashboardData = (period: 'week' | 'month' | 'quarter') => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lostSales, setLostSales] = useState<LostSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [kpisData, trendData, productsData, lostData] = await Promise.all([
        reportService.getDashboardKPIs(period),
        reportService.getSalesTrend(period),
        reportService.getTopProducts(10, period),
        reportService.getLostSales(period)
      ]);
      
      setKpis(kpisData);
      setSalesTrend(trendData);
      setTopProducts(productsData);
      setLostSales(lostData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  return { kpis, salesTrend, topProducts, lostSales, loading, error, refetch: loadDashboardData };
};

export const useSupplierAnalysis = (supplierIds?: string[], dateRange?: { startDate: string; endDate: string }) => {
  const [data, setData] = useState<SupplierPurchaseAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dateRange) {
      loadAnalysis();
    }
  }, [supplierIds, dateRange]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {
        ...dateRange,
        supplierIds
      };
      
      const result = await reportService.getSupplierAnalysis(filters);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar análisis de proveedores');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: loadAnalysis };
};