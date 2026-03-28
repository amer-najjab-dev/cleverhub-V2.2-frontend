import { useState } from 'react';
import { AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface RiskDay {
  date: string;
  shifts: Array<{
    shiftName: string;
    currentCount: number;
    requiredMin: number;
  }>;
}

interface RiskAlertProps {
  riskDays: RiskDay[];
}

export const RiskAlert = ({ riskDays }: RiskAlertProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-600" />
          <h3 className="text-sm font-semibold text-red-800">
            Alerta de Riesgo Operativo ({riskDays.length} día{riskDays.length !== 1 ? 's' : ''})
          </h3>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-red-600 hover:bg-red-100 rounded">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => setIsDismissed(true)} className="p-1 text-red-600 hover:bg-red-100 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {riskDays.map((day, idx) => (
              <div key={idx} className="text-sm">
                {day.shifts.map((shift, shiftIdx) => (
                  <span key={shiftIdx} className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
                    🔴 {new Date(day.date).toLocaleDateString('es-ES')} - {shift.shiftName}
                    <span className="font-medium">({shift.currentCount}/{shift.requiredMin})</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
