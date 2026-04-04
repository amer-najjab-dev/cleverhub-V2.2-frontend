import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, Settings } from 'lucide-react';
import { format, addDays } from 'date-fns';


interface HorizontalTimelineProps {
  startDate: Date;
  daysToShow: number;
  coverageByDay: Record<string, any[]>;
  onDateChange: (date: Date) => void;
  onDaysChange: (days: number) => void;
  onDrop?: (date: string, shiftId: number, employeeId: number) => void;
  onCellClick?: (date: string, shiftId: number, shiftName: string, employees: any[]) => void;
  onConfigClick?: (shiftId: number, shiftName: string, currentMin: number) => void;
  isDragging?: boolean;
  isAdmin?: boolean;
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
  onCellClick,
  onConfigClick,
  isDragging = false,
  isAdmin = false
}: HorizontalTimelineProps) => {
  const [draggingOver, setDraggingOver] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(80);
  const [showShiftTooltip, setShowShiftTooltip] = useState<number | null>(null);

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
    return addDays(startDate, i);
  });

  const goPrevious = () => {
    const newDate = addDays(startDate, -daysToShow);
    onDateChange(newDate);
  };

  const goNext = () => {
    const newDate = addDays(startDate, daysToShow);
    onDateChange(newDate);
  };

  const formatDay = (date: Date) => format(date, 'dd/MM');

  const getDayCoverage = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return coverageByDay[dateStr] || [];
  };

  const firstDayCoverage = getDayCoverage(days[0]);
  console.log('🔍 firstDayCoverage:', firstDayCoverage);
  console.log('🔍 coverageByDay completo:', coverageByDay);
  
  const shifts = [...firstDayCoverage]
    .sort((a, b) => a.shiftId - b.shiftId)
    .map((s: any) => ({ 
      id: s.shiftId, 
      name: s.shiftName,
      minEmployeesRequired: s.requiredMin 
    }));

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

  const handleCellClick = (dateStr: string, shiftId: number, shiftName: string) => {
    // Usar parseISO en lugar de new Date()
    const parsedDate = new Date(dateStr);
    const dayCoverage = getDayCoverage(parsedDate);
    const shiftData = dayCoverage.find((s: any) => s.shiftId === shiftId);
    const employees = shiftData?.employees || [];
    onCellClick?.(dateStr, shiftId, shiftName, employees);
  };

  const handleConfigClick = (shiftId: number, shiftName: string, currentMin: number) => {
    onConfigClick?.(shiftId, shiftName, currentMin);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={goPrevious} className="p-1.5 hover:bg-gray-100 rounded-lg border border-gray-200">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {formatDay(days[0])} - {formatDay(days[days.length - 1])}
          </span>
          <button onClick={goNext} className="p-1.5 hover:bg-gray-100 rounded-lg border border-gray-200">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex gap-2">
          {[14, 21, 30].map(days => (
            <button
              key={days}
              onClick={() => onDaysChange(days)}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                daysToShow === days ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days} días
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto" ref={containerRef}>
        <div style={{ minWidth: `${days.length * cellWidth}px` }}>
          {/* Cabecera de días */}
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

          {/* Filas de turnos */}
          {shifts.map((shift: { id: number; name: string; minEmployeesRequired: number }, shiftIdx: number) => (
            <div key={shiftIdx} className="mt-2">
              {/* Encabezado del turno con botón de configuración */}
              <div className="flex items-center justify-between px-1 mb-1">
                <div 
                  className="relative"
                  onMouseEnter={() => setShowShiftTooltip(shift.id)}
                  onMouseLeave={() => setShowShiftTooltip(null)}
                >
                  <span className="text-xs font-medium text-gray-600">{shift.name}</span>
                  {showShiftTooltip === shift.id && (
                    <div className="absolute left-0 top-5 z-10 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      Mínimo: {shift.minEmployeesRequired} empleados
                    </div>
                  )}
                </div>
                {isAdmin && onConfigClick && (
                  <button
                    onClick={() => handleConfigClick(shift.id, shift.name, shift.minEmployeesRequired)}
                    className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Configurar mínimo de empleados"
                  >
                    <Settings size={12} />
                  </button>
                )}
              </div>
              
              {/* Celdas del turno */}
              <div className="flex">
                {days.map((date, dayIdx) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
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
                      onClick={() => handleCellClick(dateStr, shift.id, shift.name)}
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
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex justify-center gap-4 mt-4 pt-3 border-t border-gray-100 flex-wrap">
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
        {isDragging && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Arrastra a una celda</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Users size={12} className="text-gray-500" />
          <span className="text-xs text-gray-500">Click para ver empleados</span>
        </div>
        {isAdmin && onConfigClick && (
          <div className="flex items-center gap-1">
            <Settings size={12} className="text-gray-500" />
            <span className="text-xs text-gray-500">Click en ⚙️ para configurar mínimo</span>
          </div>
        )}
      </div>
    </div>
  );
};