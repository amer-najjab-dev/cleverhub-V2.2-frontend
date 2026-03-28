import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalTimelineProps {
  startDate: Date;
  daysToShow: number;
  coverageByDay: Record<string, any[]>;
  onDateChange: (date: Date) => void;
  onDaysChange: (days: number) => void;
  onDrop?: (date: string, shiftId: number, employeeId: number) => void;
  isDragging?: boolean;
}

const getShiftColor = (current: number, required: number, isDraggingOver: boolean) => {
  if (isDraggingOver) return 'bg-blue-100 text-blue-700 border-blue-300 ring-2 ring-blue-400';
  if (current >= required) return 'bg-green-100 text-green-700 border-green-200';
  if (current >= required * 0.7) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

export const HorizontalTimeline = ({
  startDate,
  daysToShow,
  coverageByDay,
  onDateChange,
  onDaysChange,
  onDrop,
  isDragging = false
}: HorizontalTimelineProps) => {
  const [draggingOver, setDraggingOver] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(80);

  // Calcular ancho de celda basado en el contenedor
  useEffect(() => {
    const updateCellWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newWidth = Math.max(60, Math.min(100, containerWidth / daysToShow - 4));
        setCellWidth(newWidth);
      }
    };
    updateCellWidth();
    window.addEventListener('resize', updateCellWidth);
    return () => window.removeEventListener('resize', updateCellWidth);
  }, [daysToShow]);

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

  const formatDay = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}`;

  const getDayCoverage = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return coverageByDay[dateStr] || [];
  };

  const firstDayCoverage = getDayCoverage(days[0]);
  const shifts = firstDayCoverage.map((s: any) => ({ id: s.shiftId, name: s.shiftName }));

  const handleDragOver = (e: React.DragEvent, dateStr: string, shiftId: number) => {
    e.preventDefault();
    setDraggingOver(`${dateStr}-${shiftId}`);
  };

  const handleDragLeave = () => {
    setDraggingOver(null);
  };

  const handleDrop = (e: React.DragEvent, dateStr: string, shiftId: number) => {
    e.preventDefault();
    setDraggingOver(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.id && onDrop) {
        onDrop(dateStr, shiftId, data.id);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      {/* Controles fijos */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrevious}
            className="p-1.5 hover:bg-gray-100 rounded-lg border border-gray-200"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {formatDay(days[0])} - {formatDay(days[days.length - 1])}
          </span>
          <button
            onClick={goNext}
            className="p-1.5 hover:bg-gray-100 rounded-lg border border-gray-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex gap-2">
          {[14, 21, 30].map(days => (
            <button
              key={days}
              onClick={() => onDaysChange(days)}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                daysToShow === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days} días
            </button>
          ))}
        </div>
      </div>

      {/* Timeline con scroll horizontal */}
      <div className="overflow-x-auto" ref={containerRef}>
        <div style={{ minWidth: `${days.length * cellWidth}px` }}>
          {/* Cabecera con días */}
          <div className="flex border-b border-gray-200">
            {days.map((date, idx) => (
              <div
                key={idx}
                style={{ width: cellWidth }}
                className="text-center py-2 text-xs font-medium text-gray-500 flex-shrink-0"
              >
                {formatDay(date)}
              </div>
            ))}
          </div>

          {/* Filas por turno */}
          {shifts.map((shift: { id: number; name: string }, shiftIdx: number) => (
            <div key={shiftIdx} className="flex mt-1">
              {days.map((date, dayIdx) => {
                const dateStr = date.toISOString().split('T')[0];
                const dayCoverage = getDayCoverage(date);
                const shiftData = dayCoverage.find((s: any) => s.shiftId === shift.id);
                const current = shiftData?.currentCount || 0;
                const required = shiftData?.requiredMin || 1;
                const isOver = draggingOver === `${dateStr}-${shift.id}`;
                const colorClass = getShiftColor(current, required, isOver);

                return (
                  <div
                    key={dayIdx}
                    style={{ width: cellWidth }}
                    onDragOver={isDragging ? (e) => handleDragOver(e, dateStr, shift.id) : undefined}
                    onDragLeave={handleDragLeave}
                    onDrop={isDragging ? (e) => handleDrop(e, dateStr, shift.id) : undefined}
                    className={`p-1 m-0.5 rounded text-center transition-all cursor-pointer flex-shrink-0 ${colorClass}`}
                  >
                    <div className="text-xs font-medium">{shift.name.substring(0, 3)}</div>
                    <div className="text-xs">{current}/{required}</div>
                    {isDragging && isOver && (
                      <div className="text-[10px] mt-0.5 text-blue-600 font-medium">Soltar aquí</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex justify-center gap-4 mt-4 pt-3 border-t border-gray-100 flex-wrap">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs text-gray-600">Cobertura OK</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-xs text-gray-600">Cobertura baja (&gt;=70%)</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs text-gray-600">Riesgo (&lt;70%)</span></div>
        {isDragging && <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-xs text-gray-600">Arrastra a una celda</span></div>}
      </div>
    </div>
  );
};