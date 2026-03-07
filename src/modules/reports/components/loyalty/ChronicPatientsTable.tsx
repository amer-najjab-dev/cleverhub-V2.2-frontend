import React from 'react';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { ChronicPatient } from '../../services/loyalty.service';

interface ChronicPatientsTableProps {
  patients: ChronicPatient[];
}

export const ChronicPatientsTable: React.FC<ChronicPatientsTableProps> = ({ patients }) => {
  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-orange-700 bg-orange-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch(risk) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Calendar className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médicament</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernier achat</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jours sans achat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochain prévu</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Risque</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Contact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.clientId} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">{patient.clientName}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{patient.medication}</td>
              <td className="px-6 py-4 text-sm">
                {new Date(patient.lastPurchaseDate).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 text-center font-medium">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  patient.daysSinceLastPurchase > 60 ? 'bg-red-100 text-red-700' :
                  patient.daysSinceLastPurchase > 30 ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {patient.daysSinceLastPurchase} jours
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                {new Date(patient.nextExpectedPurchaseDate).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(patient.riskLevel)}`}>
                  {getRiskIcon(patient.riskLevel)}
                  {patient.riskLevel === 'high' ? 'Élevé' :
                   patient.riskLevel === 'medium' ? 'Moyen' : 'Faible'}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <a 
                  href={`tel:${patient.clientPhone}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {patient.clientPhone}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};