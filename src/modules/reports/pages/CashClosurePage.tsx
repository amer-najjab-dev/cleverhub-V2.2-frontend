import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileSpreadsheet,
  Printer,
  AlertCircle,
  CheckCircle,
  XCircle,
  Gift
} from 'lucide-react';
import { DatePicker } from '../components/common/DatePicker';
import { useCurrencyFormatter } from '../../../utils/formatters';
import { reportService } from '../services/report.service';

interface CashClosureData {
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
    vatBreakdown: {
      vat7: number;
      vat10: number;
      vat14: number;
      vat20: number;
      vatExempt: number;
    };
    netSales: number;
    discountTotal: number;
    returnsTotal: number;
  };
  payments: {
    cash: number;
    card: number;
    transfer: number;
    check: number;
    credit: number;
    mixed: number;
  };
  cashAudit: {
    initialFund: number;
    expectedCash: number;
    actualCash: number;
    discrepancy: number;
    manualEntries: Array<{
      id: string;
      type: 'in' | 'out';
      amount: number;
      reason: string;
      user: string;
      timestamp: string;
    }>;
    safeDrop: number;
  };
  loyaltyClosure?: {
    pointsIssued: number;
    pointsRedeemed: number;
    pointsValueMoved: number;
  };
  createdAt: string;
}

export const CashClosurePage: React.FC = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [closureData, setClosureData] = useState<CashClosureData | null>(null);
  const [actualCash, setActualCash] = useState<number | null>(null);
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [discrepancyReason, setDiscrepancyReason] = useState('');

  useEffect(() => {
    if (selectedDate) {
      loadClosure();
    }
  }, [selectedDate]);

  const loadClosure = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    try {
      const data = await reportService.getDailyClosure(selectedDate);
      setClosureData(data);
      setActualCash(data.cashAudit.expectedCash);
    } catch (error) {
      console.error('Error loading closure:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!closureData || !selectedDate) return;

    try {
      await reportService.validateClosure({
        date: selectedDate,
        actualCash: actualCash || 0,
        manualEntries: [],
        userId: 1
      });
      
      loadClosure();
      alert('Cierre validado con éxito');
    } catch (error) {
      console.error('Error validating closure:', error);
    }
  };

  const handleResolveDiscrepancy = async () => {
    if (!closureData || !selectedDate) return;

    try {
      await reportService.resolveDiscrepancy({
        date: selectedDate,
        expectedCash: closureData.cashAudit.expectedCash,
        actualCash: actualCash || 0,
        reason: discrepancyReason,
        notes: ''
      });
      
      setShowDiscrepancyModal(false);
      loadClosure();
      alert('Discrepancia resuelta');
    } catch (error) {
      console.error('Error resolving discrepancy:', error);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exportando como ${format}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  const discrepancy = closureData ? 
    (actualCash || 0) - closureData.cashAudit.expectedCash : 0;

  const totalEncaissé = closureData ? 
    (closureData.payments.cash || 0) + 
    (closureData.payments.card || 0) + 
    (closureData.payments.transfer || 0) + 
    (closureData.payments.check || 0) : 0;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Clôture de Caisse</h2>
          <p className="text-sm text-gray-500 mt-1">
            Générez votre rapport de fin de journée
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Selector de fecha */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:hidden">
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de clôture
            </label>
            <DatePicker
              date={selectedDate}
              onChange={setSelectedDate}
              placeholder="Sélectionner une date"
            />
          </div>
          <button
            onClick={loadClosure}
            disabled={!selectedDate || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Datos del cierre */}
      {closureData && !loading && (
        <>
          {/* Información de cabecera */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {closureData.fiscalData.companyName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {closureData.fiscalData.address}, {closureData.fiscalData.city}
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
                  <div><span className="text-gray-500">IF:</span> {closureData.fiscalData.if}</div>
                  <div><span className="text-gray-500">ICE:</span> {closureData.fiscalData.ice}</div>
                  <div><span className="text-gray-500">RC:</span> {closureData.fiscalData.rc}</div>
                  <div><span className="text-gray-500">CNSS:</span> {closureData.fiscalData.cnss}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Date</div>
                <div className="text-lg font-semibold">
                  {new Date(closureData.date).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-gray-500 mt-2">Caissier</div>
                <div className="font-medium">{closureData.user.fullName}</div>
              </div>
            </div>
          </div>

          {/* Resumen de ventas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Ventes</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ventes brutes</span>
                  <span className="font-medium">{formatCurrency(closureData.sales.grossSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remises</span>
                  <span className="font-medium text-red-600">-{formatCurrency(closureData.sales.discountTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retours</span>
                  <span className="font-medium text-red-600">-{formatCurrency(closureData.sales.returnsTotal)}</span>
                </div>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Ventes nettes</span>
                    <span>{formatCurrency(closureData.sales.netSales)}</span>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mt-6 mb-3">Détail TVA</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA 20%</span>
                  <span>{formatCurrency(closureData.sales.vatBreakdown.vat20)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA 14%</span>
                  <span>{formatCurrency(closureData.sales.vatBreakdown.vat14)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA 10%</span>
                  <span>{formatCurrency(closureData.sales.vatBreakdown.vat10)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA 7%</span>
                  <span>{formatCurrency(closureData.sales.vatBreakdown.vat7)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Exonéré</span>
                  <span>{formatCurrency(closureData.sales.vatBreakdown.vatExempt)}</span>
                </div>
              </div>
            </div>

            {/* Pagos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Paiements</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Espèces</span>
                  <span className="font-medium">{formatCurrency(closureData.payments.cash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carte bancaire</span>
                  <span className="font-medium">{formatCurrency(closureData.payments.card)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Virement</span>
                  <span className="font-medium">{formatCurrency(closureData.payments.transfer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chèque</span>
                  <span className="font-medium">{formatCurrency(closureData.payments.check)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                  <span className="text-gray-600 font-medium">Crédit (à recevoir)</span>
                  <span className="font-medium text-orange-600">{formatCurrency(closureData.payments.credit)}</span>
                </div>
                
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total encaissé</span>
                    <span className="text-green-600">{formatCurrency(totalEncaissé)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fidélité */}
            <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-purple-600" />
                <h4 className="text-sm font-medium text-purple-700">Fidélité</h4>
              </div>
              
              {closureData.loyaltyClosure ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-600">Points émis</span>
                    <span className="font-bold text-purple-700">{closureData.loyaltyClosure.pointsIssued}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-600">Points utilisés</span>
                    <span className="font-bold text-purple-700">{closureData.loyaltyClosure.pointsRedeemed}</span>
                  </div>
                  <div className="border-t border-purple-200 my-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-purple-700">Valeur échangée</span>
                      <span className="font-bold text-purple-700">
                        {formatCurrency(closureData.loyaltyClosure.pointsValueMoved)}
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      Produits sortis par points
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-purple-600 text-center py-4">
                  Aucune transaction de fidélité aujourd'hui
                </p>
              )}
            </div>
          </div>

          {/* Audit de caisse */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Audit de caisse</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Fond de caisse initial</div>
                <div className="text-2xl font-bold mt-1">
                  {formatCurrency(closureData.cashAudit.initialFund)}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Espèces attendues</div>
                <div className="text-2xl font-bold mt-1">
                  {formatCurrency(closureData.cashAudit.expectedCash)}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">Dépôt en coffre</div>
                <div className="text-2xl font-bold text-blue-700 mt-1">
                  {formatCurrency(closureData.cashAudit.safeDrop)}
                </div>
              </div>
            </div>

            {/* Contrôle manuel */}
            <div className="border-t border-gray-200 pt-6 print:hidden">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Espèces comptées
                  </label>
                  <input
                    type="number"
                    value={actualCash || ''}
                    onChange={(e) => setActualCash(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Saisir le montant compté"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Écart
                  </div>
                  <div className={`text-lg font-bold ${
                    discrepancy === 0 ? 'text-green-600' :
                    discrepancy > 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {discrepancy > 0 ? '+' : ''}{formatCurrency(discrepancy)}
                  </div>
                </div>
              </div>

              {discrepancy !== 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDiscrepancyModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Expliquer la discrepancy
                  </button>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleValidate}
                  disabled={!actualCash}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Valider le cierre
                </button>
              </div>
            </div>

            {/* Entrées manuelles */}
            {closureData.cashAudit.manualEntries.length > 0 && (
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Entrées manuelles</h5>
                <div className="space-y-2">
                  {closureData.cashAudit.manualEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.type === 'in' 
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {entry.type === 'in' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">{entry.reason}</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${
                          entry.type === 'in' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {entry.type === 'in' ? '+' : '-'}{formatCurrency(entry.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Información de generación */}
          <div className="text-xs text-gray-400 text-right print:block hidden">
            Généré le {new Date(closureData.createdAt).toLocaleString('fr-FR')}
          </div>
        </>
      )}

      {/* Modal de discrepancia */}
      {showDiscrepancyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Expliquer la discrepancy</h3>
            <textarea
              value={discrepancyReason}
              onChange={(e) => setDiscrepancyReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Raison de la discrepancy..."
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDiscrepancyModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleResolveDiscrepancy}
                disabled={!discrepancyReason}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de estado */}
      {!selectedDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-800">Veuillez sélectionner une date</p>
        </div>
      )}

      {selectedDate && !closureData && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800">Aucune donnée disponible pour cette date</p>
        </div>
      )}
    </div>
  );
};