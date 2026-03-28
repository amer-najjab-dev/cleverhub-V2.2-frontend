import { AlertTriangle } from 'lucide-react';
import { Alert } from '../../hooks/useHRData';

interface AlertsPanelProps {
  alerts: Alert[];
}

export const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-center">
        <div className="text-green-600 text-sm">✓ Sin alertas de riesgo</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-900">Alertas de Riesgo 
Operativo ({alerts.length})</h3>
      </div>
      <div className="space-y-2">
        {alerts.map(alert => (
          <div key={alert.id} className="p-3 bg-red-50 border border-red-200 
rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-red-800 text-sm">
                  ⚠️ {new Date(alert.date).toLocaleDateString('es-ES')} - 
{alert.shiftName}
                </div>
                <div className="text-sm text-red-700 mt-1">
                  Cobertura del {alert.percentage}% 
({alert.currentCount}/{alert.requiredMin} empleados)
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
