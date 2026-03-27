import { useState, useEffect } from 'react';
import { ShiftSwapRequest } from 
'../../../services/hr/employee.service';
import { Check, X, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShiftSwapsListProps {
  isAdmin: boolean;
}

export const ShiftSwapsList = ({ isAdmin }: ShiftSwapsListProps) => {
  const [swaps, setSwaps] = useState<ShiftSwapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSwaps();
  }, []);

  const loadSwaps = async () => {
    setLoading(true);
    try {
      // TODO: Implementar endpoint de intercambios cuando esté listo
      setSwaps([]);
    } catch (error) {
      console.error('Error loading swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (_id: number) => {
    toast.success('Funcionalidad en desarrollo');
  };

  const handleReject = async (_id: number) => {
    toast.success('Funcionalidad en desarrollo');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Solicitudes de 
intercambio de turno</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 
border-blue-600"></div>
        </div>
      ) : swaps.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock size={48} className="mx-auto mb-3 text-gray-300" />
          No hay solicitudes de intercambio
        </div>
      ) : (
        <div className="space-y-3">
          {swaps.map((swap) => (
            <div key={swap.id} className="flex items-center justify-between p-3 
border border-gray-100 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  {swap.from_employee?.user?.full_name} ↔ 
{swap.to_employee?.user?.full_name}
                </div>
                <div className="text-sm text-gray-500">
                  Fecha: {new Date(swap.date).toLocaleDateString('es-ES')}
                </div>
                <div className="text-xs text-gray-400">
                  {swap.from_shift?.name} → {swap.to_shift?.name}
                </div>
              </div>
              {isAdmin && swap.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(swap.id)}
                    className="p-1.5 text-green-600 hover:bg-green-50 
rounded-lg"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleReject(swap.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
