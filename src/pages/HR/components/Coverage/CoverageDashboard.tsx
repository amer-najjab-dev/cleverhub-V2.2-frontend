import { useState } from 'react';
import { useHRData } from '../../hooks/useHRData';
import { RiskAlert } from './RiskAlert';
import { HorizontalTimeline } from './HorizontalTimeline';
import { EmployeeSidebar } from './EmployeeSidebar';
import { UpcomingAbsences } from './UpcomingAbsences';
import { Loader2 } from 'lucide-react';

export const CoverageDashboard = () => {
  const { coverage, employees, requests, loading } = useHRData();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return date;
  });
  const [daysToShow, setDaysToShow] = useState(21);

  // Agrupar cobertura por día
  const coverageByDay = coverage.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // Obtener días con riesgo
  const riskDays = Object.entries(coverageByDay)
    .filter(([, shifts]) => {
      return (shifts as any[]).some((s: any) => s.currentCount < s.requiredMin);
    })
    .map(([date, shifts]) => ({
      date,
      shifts: (shifts as any[]).filter((s: any) => s.currentCount < s.requiredMin)
    }))
    .slice(0, 7);

  // Obtener ausencias próximas (próximos 14 días)
  const today = new Date();
  const next14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const upcomingAbsences = requests
    .filter(r => r.status === 'approved' && next14Days.includes(r.start_date))
    .map(r => ({
      ...r,
      employeeName: r.employeeName || `Empleado ${r.employee_id}`
    }))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerta consolidada */}
      {riskDays.length > 0 && (
        <RiskAlert riskDays={riskDays} />
      )}

      {/* Timeline horizontal */}
      <HorizontalTimeline
        startDate={startDate}
        daysToShow={daysToShow}
        coverageByDay={coverageByDay}
        onDateChange={setStartDate}
        onDaysChange={setDaysToShow}
      />

      {/* Panel inferior: Equipo + Ausencias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EmployeeSidebar employees={employees} requests={requests} />
        </div>
        <div>
          <UpcomingAbsences absences={upcomingAbsences} />
        </div>
      </div>
    </div>
  );
};