import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { shiftService, Shift } from '../../../../services/hr/shift.service';
import { coverageService, CoverageData } from '../../../../services/hr/coverage.service';
import { ShiftModal } from './ShiftModal';
import { AssignShiftModal } from './AssignShiftModal';
import { EditShiftModal } from './EditShiftModal';
import { toast } from 'react-hot-toast';

// ✅ Mejora 1: Nuevos colores según estado
const getStatusCircleColor = (currentCount: number, requiredMin: number) => {
  if (currentCount === 0) return 'bg-red-500';           // Rojo: sin empleados
  if (currentCount < requiredMin) return 'bg-orange-500'; // Naranja: insuficiente
  return 'bg-green-500';                                  // Verde: completo
};

export const CoverageTab = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [coverage, setCoverage] = useState<CoverageData>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
    try {
      const [shiftsData, coverageData] = await Promise.all([
        shiftService.getAll(),
        coverageService.getCoverage(startDate, endDate)
      ]);
      setShifts(shiftsData);
      setCoverage(coverageData);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const handleDeleteShift = async (id: number, name: string) => {
    if (confirm(`¿Eliminar el turno "${name}"?`)) {
      try {
        await shiftService.delete(id);
        toast.success('Turno eliminado correctamente');
        loadData();
      } catch (error) {
        console.error('Error deleting shift:', error);
        toast.error('Error al eliminar el turno');
      }
    }
  };

  const handleEditClick = (shift: Shift) => {
    setSelectedShift(shift);
    setShowEditModal(true);
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
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Turno</th>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Horario</th>
                <th className="p-3 text-center text-sm font-medium text-gray-500">Min. Personal</th>
                <th className="p-3 text-center text-sm font-medium text-gray-500">Color</th>
                <th className="p-3 text-center text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shifts.map(shift => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{shift.name}</td>
                  <td className="p-3 text-gray-600">{shift.start_time} - {shift.end_time}</td>
                  <td className="p-3 text-center">{shift.min_employees_required}</td>
                  <td className="p-3 text-center">
                    <div className="w-6 h-6 rounded-full mx-auto" style={{ backgroundColor: shift.color || '#3B82F6' }} />
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(shift)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Editar turno"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteShift(shift.id, shift.name)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Eliminar turno"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Coverage Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-500">Turno / Día</th>
                {weekDays.map((day, idx) => (
                  <th key={idx} className="p-3 text-center text-sm font-medium text-gray-500">
                    {day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shifts.map(shift => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">
                    <div>
                      <div>{shift.name}</div>
                      <div className="text-xs text-gray-500">{shift.start_time} - {shift.end_time}</div>
                    </div>
                  </td>
                  {weekDays.map((day, dayIdx) => {
                    const cellData = getCellData(day, shift.id);
                    return (
                      <td
                        key={dayIdx}
                        onClick={() => handleShiftClick(shift)}
                        className="p-2 text-center cursor-pointer transition hover:opacity-80"
                      >
                        {cellData ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${getStatusCircleColor(cellData.currentCount, cellData.requiredMin)}`} />
                            <span className="text-xs font-medium">
                              {cellData.currentCount}/{cellData.requiredMin}
                            </span>
                            {cellData.employees && cellData.employees.length > 0 && (
                              <div className="text-xs text-gray-600 truncate max-w-[80px]">
                                {cellData.employees.map((e: any) => (e.full_name || e.name || '').split(' ')[0]).filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-xs text-gray-400">0/{shift.min_employees_required}</span>
                          </div>
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
        defaultStartDate={startDate}
        defaultEndDate={endDate}
      />

      <EditShiftModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        shift={selectedShift}
        onSuccess={loadData}
      />
    </div>
  );
};