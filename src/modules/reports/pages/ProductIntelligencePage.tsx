import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Package,
  Calendar,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { useProductIntelligence } from '../hooks/useProductIntelligence';
import { useCurrencyFormatter } from '../../../utils/formatters';
import { SeasonalityChart } from '../components/products/SeasonalityChart';
import { ProductFilters } from '../components/products/ProductFilters';
import { exportService } from '../services/export.service';

export const ProductIntelligencePage: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { 
    predictions, 
    marketIntelligence, 
    emergingTrends, 
    highRiskCategories, 
    loading, 
    error, 
    refetch 
  } = useProductIntelligence();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  // Obtener listas únicas para filtros
  const laboratories = useMemo(() => {
    const labs = predictions.map(p => p.laboratory).filter(Boolean) as string[];
    return Array.from(new Set(labs)).sort();
  }, [predictions]);

  const categories = useMemo(() => {
    const cats = predictions.map(p => p.category).filter(Boolean);
    return Array.from(new Set(cats)).sort();
  }, [predictions]);

  // Aplicar filtros
  const filteredPredictions = useMemo(() => {
    return predictions.filter(p => {
      const matchesSearch = !searchTerm || 
        p.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLab = !selectedLab || p.laboratory === selectedLab;
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesLab && matchesCategory;
    });
  }, [predictions, searchTerm, selectedLab, selectedCategory]);

  // Datos para el gráfico (producto seleccionado)
  const getSeasonalData = () => {
    const months = [t('products.jan'), t('products.feb'), t('products.mar'), t('products.apr'), t('products.may'), t('products.jun'), t('products.jul'), t('products.aug'), t('products.sep'), t('products.oct'), t('products.nov'), t('products.dec')];
    const factors = months.map(() => {
      const product = predictions.find(p => p.productId === selectedProduct);
      return product?.seasonalFactor || 1.0;
    });
    return { months, factors };
  };

  const seasonalData = getSeasonalData();
  const selectedProductName = predictions.find(p => p.productId === selectedProduct)?.productName || '';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLab('');
    setSelectedCategory('');
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (format === 'excel') {
      exportService.toExcel(filteredPredictions);
    } else {
      exportService.toPDF(filteredPredictions);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const getSourceBadge = (source: 'market' | 'hybrid' | 'real') => {
    switch(source) {
      case 'real':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{t('products.real')}</span>;
      case 'hybrid':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{t('products.hybrid')}</span>;
      case 'market':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{t('products.market')}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
            <p className="text-gray-500 mt-1">{t('products.description')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.refresh')}
            </button>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('products.predicted_demand')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {marketIntelligence?.totalPredictedDemand || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('products.recommended_investment')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(marketIntelligence?.totalRecommendedInvestment || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('products.seasonal_risks')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {highRiskCategories.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('products.emerging_trends')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emergingTrends.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <ProductFilters
          laboratories={laboratories}
          categories={categories}
          selectedLab={selectedLab}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          onLabChange={setSelectedLab}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchTerm}
          onClearFilters={clearFilters}
        />

        {/* Gráfico de estacionalidad (si hay producto seleccionado) */}
        {selectedProduct && (
          <SeasonalityChart
            productName={selectedProductName}
            seasonalFactors={seasonalData.factors}
            months={seasonalData.months}
          />
        )}

        {/* Alertas y riesgos */}
        {highRiskCategories.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('products.high_risk_categories')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {highRiskCategories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tendencias emergentes */}
        {emergingTrends.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {t('products.emerging_trends_title')}
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {emergingTrends.map((trend, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{trend.laboratory}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {trend.productNames.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trend.confidence === 'high' ? 'bg-green-100 text-green-700' :
                        trend.confidence === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {trend.confidence === 'high' ? t('products.high') : trend.confidence === 'medium' ? t('products.medium') : t('products.low')}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {trend.salesCount} {t('products.sales')} / {trend.period}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{trend.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabla de predicciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold">{t('products.forecasts_title')}</h3>
            <span className="text-sm text-gray-500">
              {filteredPredictions.length} {t('products.products_count')}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('products.product')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('products.laboratory')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('products.stock')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('products.demand_30d')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('products.recommended')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('products.seasonal')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('products.source')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('products.confidence')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPredictions.map((pred) => (
                  <tr 
                    key={pred.productId} 
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedProduct === pred.productId ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedProduct(pred.productId)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{pred.productName}</div>
                      <div className="text-xs text-gray-500">{pred.category}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{pred.laboratory || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium">{pred.currentStock}</td>
                    <td className="px-6 py-4 text-right font-semibold text-blue-600">
                      {pred.predictedDemandNext30Days}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {pred.recommendedOrder > 0 ? (
                        <span className="text-green-600 font-medium">+{pred.recommendedOrder}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {pred.seasonalFactor.toFixed(1)}x
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getSourceBadge(pred.predictionSource)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              pred.confidence >= 80 ? 'bg-green-500' :
                              pred.confidence >= 60 ? 'bg-blue-500' :
                              pred.confidence >= 40 ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${pred.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{pred.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPredictions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {t('products.no_data_available')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};