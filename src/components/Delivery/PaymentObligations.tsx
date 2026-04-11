import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { deliveryService } from '../../services/delivery.service';

export const PaymentObligations = () => {
  const { id } = useParams<{ id: string }>();
  const [obligations, setObligations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadObligations();
    }
  }, [id]);

  const loadObligations = async () => {
    try {
      const response = await deliveryService.getSupplierObligations(id!);
      setObligations(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (obligationId: number, totalAmount: number) => {
    const amount = prompt('¿Cantidad a pagar?', totalAmount.toString());
    if (amount) {
      try {
        await deliveryService.registerPayment(obligationId, parseFloat(amount), 'cash');
        loadObligations();
        alert('Pago registrado');
      } catch (error) {
        alert('Error al registrar pago');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Albarán</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pagado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pendiente</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vencimiento</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {obligations.map((obl) => (
              <tr key={obl.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{obl.delivery_note?.note_number || '-'}</td>
                <td className="px-4 py-3">{obl.total_amount} MAD</td>
                <td className="px-4 py-3">{obl.paid_amount} MAD</td>
                <td className="px-4 py-3 font-semibold text-red-600">{obl.pending_amount} MAD</td>
                <td className="px-4 py-3">{new Date(obl.due_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    obl.status === 'paid' ? 'bg-green-100 text-green-800' :
                    obl.status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {obl.status === 'paid' ? 'Pagado' : obl.status === 'partial' ? 'Pago parcial' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {obl.status !== 'paid' && (
                    <button
                      onClick={() => handlePayment(obl.id, obl.pending_amount)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      Pagar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
