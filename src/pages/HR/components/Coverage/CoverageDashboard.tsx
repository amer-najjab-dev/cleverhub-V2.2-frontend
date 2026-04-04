import { useState } from 'react';
import { useHRData } from '../../hooks/useHRData';
import { useShiftAssignment } from '../../hooks/useShiftAssignment';
import { employeeService } from '../../../../services/hr/employee.service';
import { RiskAlert } from './RiskAlert';
import { HorizontalTimeline } from './HorizontalTimeline';
import { EmployeeList } from '../Employees/EmployeeList';
import { UpcomingAbsences } from './UpcomingAbsences';
import { EmployeesModal } from './EmployeesModal';
import { ShiftConfigModal } from './ShiftConfigModal';
import { EmployeeShiftAssignment } from '../EmployeeShiftAssignment';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const CoverageDashboard = () => {
  const { coverage, employees, requests, loading, refresh } = useHRData();
  const { isDragging, handleDrop, handleDragEnd } = useShiftAssignment();
  const [startDate, setStartDate] = useState(new Date());
  const [daysToShow, setDaysToShow] = useState(21);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    date: string;
    shiftId: number;
    shiftName: string;
    employees: any[];
  } | null>(null);
  
  // Estado para el modal de configuración de turnos
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedShiftConfig, setSelectedShiftConfig] = useState<{
    shiftId: number;
    shiftName: string;
    currentMin: number;
  } | null>(null);

  // Estado para el modal de asignación de empleados - CORREGIDO con setter
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedShift] = useState<{ id: number; name: string; date: string } | null>(null);

  const coverageByDay = coverage.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const riskDays = Object.entries(coverageByDay)
    .filter(([, shifts]) => (shifts as any[]).some((s: any) => s.currentCount < s.requiredMin))
    .map(([date, shifts]) => ({ date, shifts: (shifts as any[]).filter((s: any) => s.currentCount < s.requiredMin) }))
    .slice(0, 7);

  const today = new Date();
  const next14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const upcomingAbsences = requests
    .filter(r => r.status === 'approved' && next14Days.includes(r.start_date))
    .map(r => ({ ...r, employeeName: r.employeeName || `Empleado ${r.employee_id}` }))
    .slice(0, 5);

  const handleCellDrop = async (date: string, shiftId: number, employeeId: number) => {
    await handleDrop(date, shiftId, employeeId);
    await refresh();
    handleDragEnd();
  };

  // handleConfigClick - abre el modal de configuración
  const handleConfigClick = (shiftId: number, shiftName: string, currentMin: number) => {
    setSelectedShiftConfig({ shiftId, shiftName, currentMin });
    setConfigModalOpen(true);
  };

  // handleConfigUpdate - recarga los datos después de actualizar
  const handleConfigUpdate = async () => {
    await refresh();
  };

  // handleCellClick para el modal de empleados existente
  const handleCellClick = (date: string, shiftId: number, shiftName: string, employeesList: any[]) => {
    console.log('📊 Click en celda:', { date, shiftName, shiftId, employeesList });
    console.log('📊 coverageByDay para esta fecha:', coverageByDay[date]);
    
    // Obtener nombres de empleados desde sus IDs si no vienen en el objeto
    const enrichedEmployees = employeesList.map(emp => {
      console.log('🔍 Empleado recibido:', emp);
      const fullEmployee = employees.find(e => e.id === emp.id || e.user_id === emp.id);
      console.log('🔍 Empleado completo:', fullEmployee);
      return {
        id: emp.id || fullEmployee?.id,
        name: emp.name || fullEmployee?.user?.full_name,
        email: fullEmployee?.user?.email,
        phone: undefined
      };
    });
  
    setSelectedCell({
      date,
      shiftId,
      shiftName,
      employees: enrichedEmployees
    });
    setModalOpen(true);
  };

  // handleRemoveEmployee para eliminar asignaciones
  const handleRemoveEmployee = async (employeeId: number, shiftId: number, date: string) => {
    try {
      console.log('🗑️ Eliminando asignación:', { employeeId, shiftId, date });
      
      // Llamar al endpoint para eliminar la asignación
      await employeeService.removeShiftAssignment(employeeId, shiftId, date);
      
      toast.success('Empleado eliminado del turno correctamente');
      await refresh(); // Recargar datos después de eliminar
    } catch (error: any) {
      console.error('Error removing employee:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar empleado del turno');
    }
  };

  // Función para refrescar todos los datos
  const refreshAllData = async () => {
    // Recargar los datos de cobertura desde la API
    const newCoverage = await employeeService.getCoverage({
      startDate: startDate.toISOString().split('T')[0],
      endDate: new Date(startDate.getTime() + daysToShow * 86400000).toISOString().split('T')[0]
    });
    setCoverage(newCoverage);
  };

  // Obtener si el usuario es admin (esto debería venir del contexto de autenticación)
  const isAdmin = true; // Temporalmente true, en producción usar useAuth

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-4">
      {riskDays.length > 0 && <RiskAlert riskDays={riskDays} />}
      
      <HorizontalTimeline
        startDate={startDate}
        daysToShow={daysToShow}
        coverageByDay={coverageByDay}
        onDateChange={setStartDate}
        onDaysChange={setDaysToShow}
        onDrop={handleCellDrop}
        onCellClick={handleCellClick}
        onConfigClick={handleConfigClick}
        isDragging={isDragging}
        isAdmin={isAdmin}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EmployeeList />
        </div>
        <div>
          <UpcomingAbsences absences={upcomingAbsences} />
        </div>
      </div>

      {/* Modal de empleados para un turno específico */}
      <EmployeesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        date={selectedCell?.date || ''}
        shiftId={selectedCell?.shiftId || 0}
        shiftName={selectedCell?.shiftName || ''}
        employees={selectedCell?.employees || []}
        onRemoveEmployee={handleRemoveEmployee}
      />

      {/* Modal de configuración de turno */}
      <ShiftConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        shiftId={selectedShiftConfig?.shiftId || 0}
        shiftName={selectedShiftConfig?.shiftName || ''}
        currentMin={selectedShiftConfig?.currentMin || 1}
        onUpdate={handleConfigUpdate}
      />

      {/* Modal de asignación de empleados */}
      {showAssignmentModal && selectedShift && (
        <EmployeeShiftAssignment
          shiftId={selectedShift.id}
          shiftName={selectedShift.name}
          date={selectedShift.date}
          onClose={() => setShowAssignmentModal(false)}
          onAssign={refreshAllData}
        />
      )}
    </div>
  );
};