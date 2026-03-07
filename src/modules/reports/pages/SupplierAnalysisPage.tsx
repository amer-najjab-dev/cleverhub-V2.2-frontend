import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Download,
} from 'lucide-react';
import { DateRangePicker } from '../components/common/DateRangePicker';
import { useCurrencyFormatter } from '../../../utils/formatters';
import { reportService } from '../services/report.service';
import { SupplierPurchaseAnalysis } from '../types/report.types';

export const SupplierAnalysisPage: React.FC = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [analyses, setAnalyses] = useState<SupplierPurchaseAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!startDate || !endDate) {
      return; // No cargar datos si no hay fechas seleccionadas
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📅 Enviando petición con:', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        supplierIds: ['hypermedic-001', 'lodimed-001']
      });
      
      const data = await reportService.getSupplierAnalysis({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        supplierIds: ['hypermedic-001', 'lodimed-001']
      });
      
      console.log('📦 Datos recibidos:', data);
      setAnalyses(data);
    } catch (error) {
      console.error('Error loading supplier analysis:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Analyse comparative des fournisseurs</h2>
        <div className="flex gap-3">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <button 
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              setAnalyses([]);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Réinitialiser
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Mensaje si no hay fechas seleccionadas */}
      {!startDate || !endDate ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-800">Veuillez sélectionner une période pour voir l'analyse</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800">Aucune donnée disponible pour la période sélectionnée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analyses.map((analysis) => (
            <div
              key={analysis.supplierId}
              className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer ${
                selectedSupplier === analysis.supplierId
                  ? 'border-blue-300 shadow-md ring-1 ring-blue-200'
                  : 'border-gray-200 hover:shadow-md hover:border-blue-200'
              }`}
              onClick={() => setSelectedSupplier(analysis.supplierId)}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{analysis.supplierName}</h3>
                    <p className="text-sm text-gray-500">ID: {analysis.supplierId}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Facturé</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(analysis.totals?.invoiced || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Payé</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(analysis.totals?.paid || 0)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};