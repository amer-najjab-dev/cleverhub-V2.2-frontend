import { useState } from 'react';
import { useHRData } from '../../hooks/useHRData';
import { useShiftAssignment } from '../../hooks/useShiftAssignment';
import { RiskAlert } from './RiskAlert';
import { HorizontalTimeline } from './HorizontalTimeline';
import { EmployeeSidebar } from './EmployeeSidebar';
import { UpcomingAbsences } from './UpcomingAbsences';
import { EmployeesModal } from './EmployeesModal';
import { Loader2 } from 'lucide-react';

export const CoverageDashboard = () => {
  const { coverage, employees, requests, loading, refresh } = useHRData();
  const { isDragging, handleDragStart, handleDrop, handleDragEnd } = useShiftAssignment();
  const [startDate, setStartDate] = useState(new Date());
  const [daysToShow, setDaysToShow] = useState(21);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    date: string;
    shiftName: string;
    employees: any[];
  } | null>(null);

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

  const handleCellClick = (date: string, _shiftId: number, shiftName: string, employeesList: any[]) => {
    console.log('📊 Click en celda:', { date, shiftName, employeesList });
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
    shiftName,
    employees: enrichedEmployees
  });
  setModalOpen(true);
};

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
        isDragging={isDragging}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EmployeeSidebar employees={employees} requests={requests} onDragStart={handleDragStart} isDragging={isDragging} />
        </div>
        <div>
          <UpcomingAbsences absences={upcomingAbsences} />
        </div>
      </div>

      <EmployeesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        date={selectedCell?.date || ''}
        shiftName={selectedCell?.shiftName || ''}
        employees={selectedCell?.employees || []}
      />
    </div>
  );
};