import { useState } from 'react';
import { MoreVertical, Edit, Power } from 'lucide-react';

interface HeaderActionsProps {
  onEdit: () => void;
  onDisable: () => void;
  onActionSelect: (action: string) => void;
}

export const HeaderActions = ({ onEdit, onDisable, onActionSelect }: HeaderActionsProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const actions = ['Dupliquer', 'Exporter', 'Imprimer', 'Archiver'];

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-3 flex justify-end items-center gap-2 shadow-sm">
      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Edit size={18} />
        Modifier
      </button>
      <button
        onClick={onDisable}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        <Power size={18} />
        Désactiver
      </button>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <MoreVertical size={18} />
          Actions
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
            {actions.map((action) => (
              <button
                key={action}
                onClick={() => {
                  onActionSelect(action);
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};