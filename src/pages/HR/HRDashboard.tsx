import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EmployeeList } from './components/Employees/EmployeeList';
import { TimeOffRequests } from './components/TimeOff/TimeOffRequests';
import { GuardPeriods } from './components/Guard/GuardPeriods';
import { Users, Calendar, Shield } from 'lucide-react';

type TabType = 'employees' | 'timeoff' | 'guard';

export const HRDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('employees');
  const isAdmin = user?.role === 'admin';

  const tabs = [
    { id: 'employees', label: 'Equipo', icon: Users },
    { id: 'timeoff', label: 'Ausencias', icon: Calendar },
    { id: 'guard', label: 'Guardias', icon: Shield, adminOnly: true }
  ];

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">RRHH</h1>
          <div className="flex gap-6 mt-4">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium transition-all ${
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

      <div className="p-6">
        {activeTab === 'employees' && <EmployeeList />}
        {activeTab === 'timeoff' && <TimeOffRequests />}
        {activeTab === 'guard' && isAdmin && <GuardPeriods />}
      </div>
    </div>
  );
};