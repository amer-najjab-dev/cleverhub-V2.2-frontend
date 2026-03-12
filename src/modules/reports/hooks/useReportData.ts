import { useState, useEffect } from 'react';
import { reportService } from '../services/report.service';
import type { DashboardKPIs, SalesTrendItem, TopProduct } from '../services/report.service';

export const useDashboardData = (period: string) => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrendItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lostSales, setLostSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const kpisData = await reportService.getDashboardKPIs(period);
        const trendData = await reportService.getSalesTrend(period);
        const productsData = await reportService.getTopProducts(10, period);
        const lostSalesData = await reportService.getLostSales(period);

        setKpis(kpisData);
        setSalesTrend(trendData);
        setTopProducts(productsData);
        setLostSales(lostSalesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const refetch = () => {
    setLoading(true);
    // Re-fetch logic
  };

  return {
    kpis,
    salesTrend,
    topProducts,
    lostSales,
    loading,
    error,
    refetch
  };
};

export const useCashClosure = (date: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClosure = async () => {
      try {
        setLoading(true);
        const result = await reportService.getDailyClosure(date);
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (date) {
      fetchClosure();
    }
  }, [date]);

  return { data, loading, error };
};

export const useSupplierAnalysis = (filters: any) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const result = await reportService.getSupplierAnalysis(filters);
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (filters.startDate && filters.endDate) {
      fetchAnalysis();
    }
  }, [filters]);

  return { data, loading, error };
};