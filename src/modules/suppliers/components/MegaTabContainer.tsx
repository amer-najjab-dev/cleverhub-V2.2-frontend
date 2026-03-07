import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface TabGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  tabs: {
    id: string;
    label: string;
    description?: string;
  }[];
}

interface MegaTabContainerProps {
  groups: TabGroup[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export const MegaTabContainer: React.FC<MegaTabContainerProps> = ({
  groups,
  activeTab,
  onTabChange,
  children
}) => {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const activeGroup = groups.find(g => g.tabs.some(t => t.id === activeTab));
  const activeTabLabel = groups.flatMap(g => g.tabs).find(t => t.id === 
activeTab)?.label;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          {groups.map((group) => {
            const Icon = group.icon;
            const isActive = activeGroup?.id === group.id;
            const isOpen = openGroup === group.id;

            return (
              <div key={group.id} className="relative">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.id)}
                  onMouseEnter={() => setOpenGroup(group.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm 
font-medium transition-colors rounded-t-lg ${
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{group.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpen 
? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-72 bg-white 
rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                    onMouseLeave={() => setOpenGroup(null)}
                  >
                    <div className="px-3 py-2 text-xs font-semibold 
text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      {group.label}
                    </div>
                    <div className="py-1">
                      {group.tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            onTabChange(tab.id);
                            setOpenGroup(null);
                          }}
                          className={`w-full text-left px-4 py-3 
hover:bg-gray-50 transition-colors ${
                            activeTab === tab.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="text-sm font-medium 
text-gray-900">{tab.label}</div>
                          {tab.description && (
                            <div className="text-xs text-gray-500 
mt-0.5">{tab.description}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {activeTabLabel && (
          <div className="text-xs text-gray-400 mt-1 pb-2 px-1">
            Actuellement: <span className="font-medium 
text-gray-600">{activeTabLabel}</span>
          </div>
        )}
      </div>

      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
