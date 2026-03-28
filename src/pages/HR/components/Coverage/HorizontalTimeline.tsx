import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalTimelineProps {
  startDate: Date;
  daysToShow: number;
  coverageByDay: Record<string, any[]>;
  onDateChange: (date: Date) => void;
  onDaysChange: (days: number) => void;
}

const getShiftColor = (current: number, required: number) => {
  if (current >= required) return 'bg-green-100 text-green-700 border-green-200';
  if (current >= required * 0.7) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

export const HorizontalTimeline = ({
  startDate,
  daysToShow,
  coverageByDay,
  onDateChange,
  onDaysChange
}: HorizontalTimelineProps) => {
  const days = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  const goPrevious = () => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() - daysToShow);
    onDateChange(newDate);
  };

  const goNext = () => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + daysToShow);
    onDateChange(newDate);
  };

  const formatDay = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getDayCoverage = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return coverageByDay[dateStr] || [];
  };

  const firstDayCoverage = getDayCoverage(days[0]);
  const shifts = firstDayCoverage.map(s => s.shiftName);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button onClick={goPrevious} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-600">
            {formatDay(days[0])} - {formatDay(days[days.length - 1])}
          </span>
          <button onClick={goNext} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight size={20} />
          </button>
        </div>
        <select
          value={daysToShow}
          onChange={(e) => onDaysChange(parseInt(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
        >
          <option value={14}>14 dias</option>
          <option value={21}>21 dias</option>
          <option value={30}>30 dias</option>
        </select>
      </div>

      <div className="min-w-[800px]">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, 80px)` }}>
          {days.map((date, idx) => (
            <div key={idx} className="text-center py-2 text-xs font-medium text-gray-500 border-b">
              {formatDay(date)}
            </div>
          ))}
        </div>

        {shifts.map((shiftName, shiftIdx) => (
          <div key={shiftIdx} className="grid mt-1" style={{ gridTemplateColumns: `repeat(${days.length}, 80px)` }}>
            {days.map((date, dayIdx) => {
              const dayCoverage = getDayCoverage(date);
              const shiftData = dayCoverage.find(s => s.shiftName === shiftName);
              const current = shiftData?.currentCount || 0;
              const required = shiftData?.requiredMin || 1;
              const colorClass = getShiftColor(current, required);

              return (
                <div key={dayIdx} className={`p-1 m-0.5 rounded text-center ${colorClass}`}>
                  <div className="text-xs font-medium">{shiftName.substring(0, 3)}</div>
                  <div className="text-xs">{current}/{required}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600">Cobertura OK</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
           <span className="text-xs text-gray-600">Cobertura baja (&gt;=70%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-600">Riesgo (&lt;70%)</span>
        </div>
      </div>
    </div>
  );
};