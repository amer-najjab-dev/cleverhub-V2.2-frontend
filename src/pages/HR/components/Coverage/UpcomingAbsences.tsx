import { Calendar, User } from 'lucide-react';

interface Absence {
  id: number;
  employeeName: string;
  start_date: string;
  end_date: string;
  type: string;
}

interface UpcomingAbsencesProps {
  absences: Absence[];
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'vacation': return 'bg-green-100 text-green-700';
    case 'sick': return 'bg-amber-100 text-amber-700';
    case 'medical': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'vacation': return 'Vacaciones';
    case 'sick': return 'Enfermedad';
    case 'medical': return 'Cita médica';
    default: return type;
  }
};

export const UpcomingAbsences = ({ absences }: UpcomingAbsencesProps) => {
  if (absences.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Ausencias próximas</h3>
        <div className="text-center py-6 text-gray-400"><Calendar size={32} className="mx-auto mb-2" /><p className="text-sm">No hay ausencias programadas</p></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Ausencias próximas</h3>
      <div className="space-y-2">
        {absences.map(absence => (
          <div key={absence.id} className="flex items-start gap-2 p-2 border border-gray-100 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><User size={14} className="text-gray-600" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{absence.employeeName}</div>
              <div className="text-xs text-gray-500 mt-0.5">{new Date(absence.start_date).toLocaleDateString('es-ES')} - {new Date(absence.end_date).toLocaleDateString('es-ES')}</div>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${getTypeColor(absence.type)}`}>{getTypeLabel(absence.type)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
