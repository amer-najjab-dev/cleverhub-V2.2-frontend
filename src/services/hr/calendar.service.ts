import { api } from '../api';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'holiday' | 'vacation' | 'sick' | 'maternity' | 'paternity' | 'medical_leave';
  color: string;
  allDay: boolean;
  employeeName?: string;
  employeeId?: number;
}

export const calendarService = {
  getEvents: async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
    const response = await api.get('/hr/calendar/events', {
      params: { startDate, endDate }
    });
    return response.data.data;
  }
};
