import { api } from '../api';

export interface CoverageData {
  [date: string]: {
    [shiftId: number]: {
      shift: {
        id: number;
        name: string;
        start_time: string;
        end_time: string;
        color: string;
        min_employees_required: number;
      };
      employees: Array<{
        id: number;
        full_name: string;
        email: string;
      }>;
      currentCount: number;
      requiredMin: number;
      status: 'full' | 'warning' | 'risk';
    };
  };
}

export const coverageService = {
  getCoverage: async (startDate: string, endDate: string): Promise<CoverageData> => {
    const response = await api.get(`/hr/shift-assignments/coverage?startDate=${startDate}&endDate=${endDate}`);
    const assignments = response.data.data;
    
    // Transformar el array en el formato esperado por el componente
    const coverageMap: CoverageData = {};
    
    assignments.forEach((assignment: any) => {
      const date = assignment.date.split('T')[0];
      const shiftId = assignment.shift_id;
      
      if (!coverageMap[date]) {
        coverageMap[date] = {};
      }
      
      // Si ya existe un empleado para este turno en esta fecha, agregar
      if (coverageMap[date][shiftId]) {
        coverageMap[date][shiftId].employees.push({
          id: assignment.employee.user.id,
          full_name: assignment.employee.user.full_name,
          email: assignment.employee.user.email
        });
        coverageMap[date][shiftId].currentCount++;
      } else {
        coverageMap[date][shiftId] = {
          shift: assignment.shift,
          employees: [{
            id: assignment.employee.user.id,
            full_name: assignment.employee.user.full_name,
            email: assignment.employee.user.email
          }],
          currentCount: 1,
          requiredMin: assignment.shift.min_employees_required,
          status: 1 >= assignment.shift.min_employees_required ? 'full' : 'risk'
        };
      }
    });
    
    return coverageMap;
  }
};