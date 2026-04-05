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
    const response = await api.get(`/hr/coverage?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  }
};
