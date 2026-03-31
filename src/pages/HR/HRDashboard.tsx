import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarView } from './components/Calendar/CalendarView';
import { AlertsPanel } from './components/Alerts/AlertsPanel';
import { RequestsPanel } from './components/Requests/RequestsPanel';
import { GuardSchedule } from './components/Guard/GuardSchedule';
import { useHRData } from './hooks/useHRData';
import { Loader2 } from 'lucide-react';
import { CoverageDashboard } from './components/Coverage/CoverageDashboard';

type TabType = 'calendar' | 'coverage';

export const HRDashboard = () => {
  const { user } = useAuth();
  // Recuperar la pestaña activa de localStorage
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('hr_active_tab');
    return (saved === 'calendar' || saved === 'coverage') ? saved : 'calendar';
  });
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('month');
  
  const {
    shifts,
    requests,
    guardPeriods,
    alerts,
    calendarEvents,
    loading,
    approveRequest,
    rejectRequest,
    createGuardPeriod,
    deleteGuardPeriod,
  } = useHRData();
  
  const isAdmin = user?.role === 'ADMIN';

  // Guardar la pestaña activa en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('hr_active_tab', activeTab);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">RRHH</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1.5 text-sm rounded-lg ${activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Calendario
              </button>
              <button
                onClick={() => setActiveTab('coverage')}
                className={`px-3 py-1.5 text-sm rounded-lg ${activeTab === 'coverage' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Cobertura
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CalendarView events={calendarEvents} view={calendarView} onViewChange={setCalendarView} onDateChange={() => {}} />
            </div>
            <div className="space-y-6">
              <AlertsPanel alerts={alerts} />
              {isAdmin && <RequestsPanel requests={requests} onApprove={approveRequest} onReject={rejectRequest} />}
              <GuardSchedule shifts={shifts} guardPeriods={guardPeriods} onCreate={createGuardPeriod} onDelete={deleteGuardPeriod} />
            </div>
          </div>
        )}

        {activeTab === 'coverage' && <CoverageDashboard />}
      </div>
    </div>
  );
};