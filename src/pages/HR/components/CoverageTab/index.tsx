import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { shiftService, Shift } from '../../../../services/hr/shift.service';
import { coverageService, CoverageData } from '../../../../services/hr/coverage.service';
import { ShiftModal } from './ShiftModal';
import { AssignShiftModal } from './AssignShiftModal';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'full': return 'bg-green-100 text-green-700 border-green-200';
    case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'risk': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'full': return '✅';
    case 'warning': return '🟡';
    case 'risk': return '🔴';
    default: return '⚪';
  }
};

export const CoverageTab = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [coverage, setCoverage] = useState<CoverageData>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const startDate = weekDays[0].toISOString().split('T')[0];
  const endDate = weekDays[6].toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    //setIsLoading(true);
    try {
      const [shiftsData, coverageData] = await Promise.all([
        shiftService.getAll(),
        coverageService.getCoverage(startDate, endDate)
      ]);
      setShifts(shiftsData);
      setCoverage(coverageData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      //setIsLoading(false);
    }
  };

  const changeWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const getCellData = (date: Date, shiftId: number) => {
    const dateKey = date.toISOString().split('T')[0];
    return coverage[dateKey]?.[shiftId] || null;
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setShowAssignModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">
            {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
          </span>
          <button onClick={() => changeWeek(1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setShowShiftModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nuevo Turno
        </button>
      </div>

      {/* Coverage Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-32 p-3 text-left text-sm font-medium text-gray-500">Turno / Día</th>
                {weekDays.map(day => (
                  <th key={day.toISOString()} className="p-3 text-center text-sm font-medium text-gray-500">
                    <div>{day.toLocaleDateString('es', { weekday: 'short' })}</div>
                    <div className="text-xs">{day.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shifts.map(shift => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.color }} />
                      <span>{shift.name}</span>
                      <span className="text-xs text-gray-400">({shift.start_time}-{shift.end_time})</span>
                    </div>
                  </td>
                  {weekDays.map(day => {
                    const cellData = getCellData(day, shift.id);
                    return (
                      <td
                        key={day.toISOString()}
                        onClick={() => handleShiftClick(shift)}
                        className={`p-2 text-center cursor-pointer transition ${cellData ? 'hover:opacity-80' : 
'hover:bg-gray-50'}`}
                      >
                        {cellData ? (
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm 
${getStatusColor(cellData.status)}`}>
                            <span>{getStatusIcon(cellData.status)}</span>
                            <span>{cellData.currentCount}/{cellData.requiredMin}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ShiftModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        onSuccess={loadData}
      />

      <AssignShiftModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        shift={selectedShift}
        shifts={shifts}
        onSuccess={loadData}
      />
    </div>
  );
};
