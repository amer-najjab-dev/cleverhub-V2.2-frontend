import { useState, useEffect, useCallback } from 'react';
import { employeeService, Employee, Shift, TimeOffRequest, GuardPeriod } from 
'../../../services/hr/employee.service';
import { toast } from 'react-hot-toast';

export interface Holiday {
  id: number;
  name: string;
  date: string;
  is_recurring: boolean;  // Cambiar de isRecurring a is_recurring
}

export interface Alert {
  id: string;
  date: string;
  shiftName: string;
  currentCount: number;
  requiredMin: number;
  percentage: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'vacation' | 'sick' | 'medical' | 'medical_leave' | 'maternity' | 
'paternity' | 'guard' | 'holiday';
  employeeName?: string;
  employeeId?: number;
  status?: string;
  color: string;
}

export const useHRData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [guardPeriods, setGuardPeriods] = useState<GuardPeriod[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [coverage, setCoverage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [employeesData, shiftsData, requestsData, guardData, holidaysData] = 
await Promise.all([
        employeeService.getEmployees(),
        employeeService.getShifts(),
        employeeService.getTimeOffRequests(),
        employeeService.getGuardPeriods(),
        employeeService.getHolidays?.() || Promise.resolve([])
      ]);
      
      setEmployees(employeesData);
      setShifts(shiftsData);
      setRequests(requestsData);
      setGuardPeriods(guardData);
      setHolidays(holidaysData);
      
      // Generar eventos del calendario
      const events: CalendarEvent[] = [];
      
      // Eventos de vacaciones/ausencias
      requestsData.forEach(req => {
        let type: CalendarEvent['type'] = 'vacation';
        let color = '#10b981';
        
        switch (req.type) {
          case 'vacation':
            type = 'vacation';
            color = '#10b981';
            break;
          case 'sick':
            type = 'sick';
            color = '#f59e0b';
            break;
          case 'medical':
            type = 'medical';
            color = '#eab308';
            break;
          case 'medical_leave':
            type = 'medical_leave';
            color = '#3b82f6';
            break;
          case 'maternity':
            type = 'maternity';
            color = '#a855f7';
            break;
          case 'paternity':
            type = 'paternity';
            color = '#b45309';
            break;
        }
        
        let typeLabel = '';
        if (req.type === 'vacation') typeLabel = 'Vacaciones';
        else if (req.type === 'sick') typeLabel = 'Enfermedad';
        else if (req.type === 'medical') typeLabel = 'Cita medica';
        else if (req.type === 'medical_leave') typeLabel = 'Licencia medica';
        else if (req.type === 'maternity') typeLabel = 'Baja maternidad';
        else if (req.type === 'paternity') typeLabel = 'Baja paternidad';
        else typeLabel = 'Licencia';
        events.push({
          id: `request-${req.id}`,
          title: `${req.employeeName || `Empleado ${req.employee_id}`} - ${typeLabel}`,
          start: new Date(req.start_date),
          end: new Date(req.end_date),
          type,
          employeeName: req.employeeName,
          employeeId: req.employee_id,
          status: req.status,
          color
        });
      });
      
      // Eventos de guardias
      guardData.forEach(guard => {
        events.push({
          id: `guard-${guard.id}`,
          title: `Guardia ${guard.shift_name || ''}`,
          start: new Date(guard.start_date),
          end: new Date(guard.end_date),
          type: 'guard',
          color: '#ef4444'
        });
      });
      
      // Eventos de días festivos
      holidaysData.forEach(holiday => {
        events.push({
          id: `holiday-${holiday.id}`,
          title: holiday.name,
          start: new Date(holiday.date),
          end: new Date(holiday.date),
          type: 'holiday',
          color: '#6b7280'
        });
      });
      
      setCalendarEvents(events);
      
      // Calcular cobertura para los próximos 14 días
      await calculateCoverage();
      
    } catch (error) {
      console.error('Error loading HR data:', error);
      toast.error('Error al cargar datos de RRHH');
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateCoverage = async () => {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 14);
      
      const coverageData = await employeeService.getCoverage({
        startDate: today.toISOString(),
        endDate: endDate.toISOString()
      });
      
      setCoverage(coverageData);
      
      // Generar alertas
      const newAlerts: Alert[] = [];
      coverageData.forEach((day: any) => {
        if (day.currentCount < day.requiredMin) {
          const percentage = Math.round((day.currentCount / day.requiredMin) * 
100);
          newAlerts.push({
            id: `${day.date}-${day.shiftId}`,
            date: day.date,
            shiftName: day.shiftName,
            currentCount: day.currentCount,
            requiredMin: day.requiredMin,
            percentage
          });
        }
      });
      setAlerts(newAlerts);
      
    } catch (error) {
      console.error('Error calculating coverage:', error);
    }
  };

  const approveRequest = async (id: number) => {
    try {
      await employeeService.approveTimeOff(id);
      toast.success('Solicitud aprobada');
      loadData();
    } catch (error) {
      toast.error('Error al aprobar');
    }
  };

  const rejectRequest = async (id: number) => {
    try {
      await employeeService.rejectTimeOff(id);
      toast.success('Solicitud rechazada');
      loadData();
    } catch (error) {
      toast.error('Error al rechazar');
    }
  };

  const createGuardPeriod = async (shiftId: number, startDate: string, endDate: 
string) => {
    try {
      await employeeService.createGuardPeriod({ shiftId, startDate, endDate });
      toast.success('Guardia programada');
      loadData();
    } catch (error) {
      toast.error('Error al programar guardia');
    }
  };

  const deleteGuardPeriod = async (id: number) => {
    try {
      await employeeService.deleteGuardPeriod(id);
      toast.success('Guardia eliminada');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar guardia');
    }
  };

  const createHoliday = async (name: string, date: string, isRecurring: boolean) => {
    try {
      await employeeService.createHoliday({ name, date, isRecurring });
      toast.success('Festivo agregado');
      loadData();
    } catch (error) {
      toast.error('Error al agregar festivo');
    }
  };

  const deleteHoliday = async (id: number) => {
    try {
      await employeeService.deleteHoliday(id);
      toast.success('Festivo eliminado');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar festivo');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    employees,
    shifts,
    requests,
    guardPeriods,
    holidays,
    alerts,
    coverage,
    calendarEvents,
    loading,
    approveRequest,
    rejectRequest,
    createGuardPeriod,
    deleteGuardPeriod,
    createHoliday,
    deleteHoliday,
    refresh: loadData
  };
};
