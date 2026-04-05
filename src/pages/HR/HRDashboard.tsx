import { useState } from 'react';
import { Calendar, Users, FileText, Settings, BarChart3 } from 'lucide-react';
import { CoverageTab } from './components/CoverageTab';
import { CalendarTab } from './components/CalendarTab';
import { RequestsTab } from './components/RequestsTab';
import { ConfigTab } from './components/ConfigTab';
import { EmployeesTab } from './components/EmployeesTab';

type TabType = 'coverage' | 'employees' | 'payroll' | 'calendar' | 'requests' | 'config';

const tabs = [
  { id: 'coverage' as TabType, label: 'Cobertura', icon: BarChart3 },
  { id: 'employees' as TabType, label: 'Empleados', icon: Users },
  { id: 'payroll' as TabType, label: 'Nóminas', icon: FileText },
  { id: 'calendar' as TabType, label: 'Calendario', icon: Calendar },
  { id: 'requests' as TabType, label: 'Solicitudes', icon: Users },
  { id: 'config' as TabType, label: 'Configuración', icon: Settings }
];

export const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('coverage');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">RRHH</h1>
        </div>
        <div className="px-6 border-t border-gray-100">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'coverage' && <CoverageTab />}
        {activeTab === 'employees' && <EmployeesTab />}
        {activeTab === 'payroll' && <div className="text-center py-20 text-gray-500">Próximamente...</div>}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'requests' && <RequestsTab />}
        {activeTab === 'config' && <ConfigTab />}
      </div>
    </div>
  );
};