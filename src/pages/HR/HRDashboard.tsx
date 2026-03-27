import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { employeeService, VacationBalance } from 
'../../services/hr/employee.service';
import { CoverageCalendar } from './components/CoverageCalendar';
import { TimeOffRequestsList } from './components/TimeOffRequestsList';
import { ShiftSwapsList } from './components/ShiftSwapsList';
import { EmployeeList } from './components/EmployeeList';
import { SettingsPanel } from './components/SettingsPanel';
import { Calendar, Users, Clock, Settings, CheckSquare, Umbrella } from 
'lucide-react';

type TabType = 'calendar' | 'requests' | 'swaps' | 'employees' | 'settings';

export const HRDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    if (!isAdmin) {
      loadBalance();
    }
  }, []);
  
  const loadBalance = async () => {
    try {
      const data = await employeeService.getVacationBalance();
      setBalance(data);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };
  
  const tabs = [
    { id: 'calendar', label: 'Calendario', icon: Calendar, adminOnly: false },
    { id: 'requests', label: 'Solicitudes', icon: CheckSquare, adminOnly: false 
},
    { id: 'swaps', label: 'Intercambios', icon: Clock, adminOnly: false },
    { id: 'employees', label: 'Empleados', icon: Users, adminOnly: true },
    { id: 'settings', label: 'Configuración', icon: Settings, adminOnly: true },
  ];
  
  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 
shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de 
RRHH</h1>
              <p className="text-sm text-gray-500 mt-1">
                {isAdmin ? 'Gestion de turnos y personal' : 'Mis vacaciones y turnos'}
              </p>
            </div>
            {activeTab === 'requests' && !isAdmin && balance && (
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 rounded-lg px-3 py-1.5">
                  <span className="text-sm text-blue-700">
                    Vacaciones: <span 
className="font-semibold">{balance.remainingDays}</span> / {balance.totalDays} 
días
                  </span>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg 
hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Umbrella size={18} />
                  Solicitar vacaciones
                </button>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-gray-200">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm 
font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'calendar' && (
         <CoverageCalendar
          view={calendarView}
          onViewChange={setCalendarView}
          onDateChange={() => {}} // o elimina esta prop si no es necesaria
          isAdmin={isAdmin}
        />
        )}
        
        {activeTab === 'requests' && (
          <TimeOffRequestsList
            isAdmin={isAdmin}
            showRequestModal={showRequestModal}
            onCloseRequestModal={() => setShowRequestModal(false)}
            onRequestCreated={() => {
              if (!isAdmin) loadBalance();
            }}
          />
        )}
        
        {activeTab === 'swaps' && (
          <ShiftSwapsList isAdmin={isAdmin} />
        )}
        
        {activeTab === 'employees' && isAdmin && (
          <EmployeeList />
        )}
        
        {activeTab === 'settings' && isAdmin && (
          <SettingsPanel />
        )}
      </div>
    </div>
  );
};
