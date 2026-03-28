import { Calendar } from 'lucide-react';

interface CoverageItem {
  date: string;
  shiftName: string;
  currentCount: number;
  requiredMin: number;
}

interface CoverageChartProps {
  coverage: CoverageItem[];
}

export const CoverageChart = ({ coverage }: CoverageChartProps) => {
  // Agrupar por fecha
  const groupedByDate = coverage.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, CoverageItem[]>);

  const dates = Object.keys(groupedByDate).sort();

  const getPercentage = (current: number, required: number) => {
    return Math.round((current / required) * 100);
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (dates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-center">
        <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-gray-500 text-sm">Cargando cobertura...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Cobertura de 
Turnos - Próximos 14 días</h3>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {dates.map(date => (
          <div key={date}>
            <div className="text-sm font-medium text-gray-700 mb-2">
              {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', 
day: 'numeric', month: 'long' })}
            </div>
            <div className="space-y-2">
              {groupedByDate[date].map((item, idx) => {
                const percentage = getPercentage(item.currentCount, 
item.requiredMin);
                const isCritical = percentage < 70;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-20 text-sm 
text-gray-600">{item.shiftName}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full 
overflow-hidden">
                          <div
                            className={`h-full rounded-full 
${getBarColor(percentage)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium w-12 text-right ${
                          isCritical ? 'text-red-600' : percentage >= 100 ? 
'text-green-600' : 'text-amber-600'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.currentCount}/{item.requiredMin} empleados
                        {isCritical && <span className="ml-2 text-red-500">⚠️ 
Riesgo</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
