import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Heart, Bell, ShoppingBag, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clientsService } from '../../services/clients.service';
import { Client, ClientDebt, ClientHealthRecord, HealthStats } from '../../services/clients.service';
import HealthCharts from '../../components/HealthCharts';

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Client | null>(null);
  const [debt, setDebt] = useState<ClientDebt | null>(null);
  const [healthRecords, setHealthRecords] = useState<ClientHealthRecord[]>([]);
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'financial' | 'health' | 'purchases'>('personal');
  
  // Estados para pagos
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  
  // Estados para nuevo registro de salud
  const [newRecord, setNewRecord] = useState({
    glucoseLevel: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    weight: '',
    heartRate: '',
    recordDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Validar que el ID sea un número válido antes de cualquier acción
  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) {
      toast.error('ID de cliente inválido');
      navigate('/clients');
      return;
    }
    
    const clientId = parseInt(id, 10);
    fetchClientData(clientId);
  }, [id, navigate]);

  const fetchClientData = async (clientId: number) => {
    try {
      setLoading(true);
      
      // Fetch client basic info
      const clientResponse = await clientsService.getById(clientId);
      setClient(clientResponse.data);
      
     // Fetch client debt
    try {
      console.log('📊 Obteniendo deuda para cliente:', clientId);
      
      const debtResponse = await clientsService.getDebt(clientId);
      const debtData = debtResponse.data;
      
      console.log('📊 Respuesta deuda:', debtData);
      
      // Si es array, tomar la deuda activa (pending_amount > 0)
      if (Array.isArray(debtData) && debtData.length > 0) {
        const activeDebt = debtData.find((d: any) => Number(d.pending_amount) > 0) || debtData[0];
        console.log('💰 ACTIVE DEBT encontrada:', activeDebt);
        console.log('💰 pending_amount:', activeDebt.pending_amount);
        setDebt(activeDebt);
        console.log('📊 Estado debt actualizado');
      } else if (debtData && !Array.isArray(debtData)) {
        console.log('💰 DEBT (objeto):', debtData);
        setDebt(debtData);
      } else {
        console.log('💰 No hay deuda');
        setDebt(null);
      }
    } catch (error) {
      console.log('No debt found for client', error);
    }

      
      // Fetch health records
      const healthResponse = await clientsService.getHealthRecords(clientId);
      setHealthRecords(healthResponse.data);
      
      // Fetch health stats
      try {
        const statsResponse = await clientsService.getHealthStats(clientId);
        setHealthStats(statsResponse.data);
      } catch (error) {
        console.log('No health stats available');
      }
      
      // Fetch purchase history
      try {
        const purchaseResponse = await clientsService.getClientPurchases(clientId);
        console.log('📦 Purchase history response:', purchaseResponse);
        console.log('📦 Purchase data:', purchaseResponse.data); // ← solo data, no data.data
        setPurchaseHistory(purchaseResponse.data || []); 
        console.log('📦 PURCHASE DATA RAW:', purchaseResponse.data);
        console.log('📦 FIRST PURCHASE:', purchaseResponse.data?.[0]);
      } catch (error) {
        console.log('No purchase history found for client');
      }
      
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Error al cargar los datos del cliente');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleFullPayment = async () => {
    if (!client) return;
    const montoPendiente = Number(debt?.pending_amount || 0);
    if (!debt || montoPendiente <= 0) {
      toast.error('No hay importe pendiente para pagar');
      return;
    }

    const montoRedondeado = Math.round(montoPendiente * 100) / 100;

    try {
      await clientsService.registerPayment(client.id, {
        amount: montoRedondeado,
        paymentMethod: 'cash',
        notes: 'Pago completo del importe pendiente'
      });

      toast.success('Pago completo registrado exitosamente');
      fetchClientData(client.id);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.error || 'Error al registrar el pago');
    }
  };

  const handlePartialPayment = async () => {
    if (!client) return;
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('Por favor ingrese un monto válido');
      return;
    }

    if (debt) {
      const pending = debt.pending_amount !== undefined && !isNaN(Number(debt.pending_amount))
        ? Number(debt.pending_amount)
        : Number(debt.total_debt) - Number(debt.paid_amount);
      if (amount > pending) {
        toast.error('El monto excede el importe pendiente');
        return;
      }
    }

    try {
      console.log('📤 Enviando pago:', { amount, clientId: client.id });
      
      await clientsService.registerPayment(client.id, {
        amount,
        paymentMethod: 'cash',
        notes: paymentNotes || 'Pago parcial'
      });

      toast.success('Pago registrado exitosamente');
      setPaymentAmount('');
      setPaymentNotes('');
      
      console.log('🔄 Recargando datos del cliente...');
      await fetchClientData(client.id);
      console.log('✅ Datos del cliente recargados');
      
    } catch (error: any) {
      console.error('Error processing partial payment:', error);
      toast.error(error.response?.data?.error || 'Error al registrar el pago');
    }
  };

  const handleCreateHealthRecord = async () => {
    if (!client) return;
    const recordData = {
      clientId: client.id,
      glucoseLevel: newRecord.glucoseLevel ? parseFloat(newRecord.glucoseLevel) : undefined,
      bloodPressureSystolic: newRecord.bloodPressureSystolic ? parseInt(newRecord.bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: newRecord.bloodPressureDiastolic ? parseInt(newRecord.bloodPressureDiastolic) : undefined,
      weight: newRecord.weight ? parseFloat(newRecord.weight) : undefined,
      heartRate: newRecord.heartRate ? parseInt(newRecord.heartRate) : undefined,
      recordDate: newRecord.recordDate,
      notes: newRecord.notes || undefined
    };

    try {
      await clientsService.createHealthRecord(client.id, recordData);
      toast.success('Registro de salud creado exitosamente');
      
      setNewRecord({
        glucoseLevel: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        weight: '',
        heartRate: '',
        recordDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      fetchClientData(client.id);
    } catch (error) {
      console.error('Error creating health record:', error);
      toast.error('Error al crear el registro de salud');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'ideal':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'alerta':
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'alta':
      case 'baja':
      case 'peligro':
      case 'pending':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusConfig = (status: string | undefined) => {
    if (!status) return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-3 h-3" /> };
    
    switch (status.toLowerCase()) {
      case 'paid':
        return { text: 'Pagado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> };
      case 'partial':
        return { text: 'Pago Parcial', color: 'bg-amber-100 text-amber-800', icon: <Clock className="w-3 h-3" /> };
      case 'pending':
        return { text: 'Pendiente', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3 h-3" /> };
      case 'cancelled':
        return { text: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-3 h-3" /> };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-3 h-3" /> };
    }
  };

  const getSaleStatusConfig = (status: string | undefined) => {
    if (!status) return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    
    switch (status.toLowerCase()) {
      case 'completed':
        return { text: 'Completada', color: 'bg-green-100 text-green-800' };
      case 'pending':
        return { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
      case 'cancelled':
        return { text: 'Cancelada', color: 'bg-red-100 text-red-800' };
      case 'refunded':
        return { text: 'Reembolsada', color: 'bg-purple-100 text-purple-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getPaymentMethodText = (method: string | undefined) => {
    if (!method) return 'No especificado';
    
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'Credit Card':
        return 'Tarjeta';
      case 'credit':
        return 'Crédito';
      case 'Bank Transfer':
        return 'Transferencia';
      case 'Bank Cheque':
        return 'Cheque';
      case 'mixed':
        return 'Mixto';
      default:
        return method;
    }
  };

  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (value: any): string => {
    const num = safeNumber(value);
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando información del cliente...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Cliente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a clientes
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-2xl font-bold">
                  {client.first_name?.charAt(0)}{client.last_name?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {client.first_name} {client.last_name}
                </h1>
                <p className="text-gray-600">{client.email}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Editar
            </button>
            <button 
              onClick={() => navigate(`/sales?clientId=${client.id}&clientName=${client.first_name}+${client.last_name}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-4 px-1 ${activeTab === 'personal' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Datos Personales
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`pb-4 px-1 ${activeTab === 'financial' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            <DollarSign className="inline mr-2" size={18} />
            Financiero
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`pb-4 px-1 ${activeTab === 'health' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            <Heart className="inline mr-2" size={18} />
            Salud
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`pb-4 px-1 ${activeTab === 'purchases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            <ShoppingBag className="inline mr-2" size={18} />
            Compras
          </button>
        </nav>
      </div>

      {/* Personal Data Tab */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Teléfono</label>
                <p className="text-gray-900">{client.phone || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">DNI</label>
                <p className="text-gray-900">{client.dni || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Dirección</label>
                <p className="text-gray-900">{client.address || 'No especificada'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Fecha de Nacimiento</label>
                <p className="text-gray-900">
                  {client.birth_date ? new Date(client.birth_date).toLocaleDateString('es-ES') : 'No especificada'}
                </p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Médica</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Alergias</label>
                <p className="text-gray-900">{client.allergies || 'Ninguna registrada'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Condiciones Crónicas</label>
                <p className="text-gray-900">{client.chronic_conditions || 'Ninguna registrada'}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm text-gray-500">Embarazada</label>
                  <p className="text-gray-900">{client.is_pregnant ? 'Sí' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Lactando</label>
                  <p className="text-gray-900">{client.is_lactating ? 'Sí' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de Compras</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-sm text-gray-500">Compras Totales</label>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(Number(client.total_purchases || 0))}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Última Compra</label>
                  <p className="text-gray-900">
                    {client.last_purchase_date 
                      ? new Date(client.last_purchase_date).toLocaleDateString('es-ES')
                      : 'Nunca'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Puntos de Fidelidad</label>
                  <p className="text-2xl font-bold text-blue-600">{client.loyalty_points || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Debt Summary */}
          <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Deuda</h2>
            
            {debt ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <label className="text-sm text-gray-500">Pendiente</label>
                    <p className="text-2xl font-bold text-red-600">
                      {(() => {
                        console.log('📊 DEBT OBJECT:', debt);
                        console.log('📊 total_debt:', debt.total_debt);
                        console.log('📊 pending_amount:', debt.pending_amount);
                        console.log('📊 status:', debt.status);
                        return formatCurrency(Number(debt.pending_amount || 0));
                      })()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Estado</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(debt.status)}`}>
                    {debt.status === 'paid' ? 'Pagado' :
                     debt.status === 'partial' ? 'Parcial' :
                     debt.status === 'pending' ? 'Pendiente' :
                     debt.status === 'overdue' ? 'Vencido' : debt.status}
                  </span>
                </div>
                
                {debt.last_payment_date && (
                  <div>
                    <label className="text-sm text-gray-500">Último Pago</label>
                    <p className="text-gray-900">
                      {new Date(debt.last_payment_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
                
                {debt.notes && (
                  <div>
                    <label className="text-sm text-gray-500">Notas</label>
                    <p className="text-gray-900 whitespace-pre-line">{debt.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="mx-auto text-gray-300" size={48} />
                <p className="text-gray-600 mt-2">No hay deudas registradas</p>
              </div>
            )}
          </div>

          {/* Payment Actions */}
          <div className="space-y-6">
            {/* Full Payment */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Pago Completo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Pagar el importe pendiente completo
              </p>
            <button
              onClick={handleFullPayment}
              disabled={!debt || Number(debt.pending_amount || 0) <= 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Pagar {debt ? formatCurrency(Number(debt.pending_amount || 0)) : '0€'}
            </button>
            </div>

            {/* Partial Payment */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Pago Parcial</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Monto ({formatCurrency(0).split(' ')[1] || 'MAD'})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Notas (opcional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Descripción del pago"
                  />
                </div>
                <button
                  onClick={handlePartialPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Registrar Pago Parcial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Tab */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Stats */}
          <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de Salud</h2>
            
            {healthRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Glucemia</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tensión</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latidos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {healthRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(record.recordDate).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3">
                          {record.glucoseLevel ? (
                            <div className="text-sm">
                              <span className="text-gray-900">{record.glucoseLevel}g</span>
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(record.glucoseStatus || '')}`}>
                                {record.glucoseStatus}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {record.bloodPressureSystolic && record.bloodPressureDiastolic ? (
                            <div className="text-sm">
                              <span className="text-gray-900">
                                {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(record.bloodPressureStatus || '')}`}>
                                {record.bloodPressureStatus}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.weight ? `${record.weight}kg` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {record.heartRate ? (
                            <div className="text-sm">
                              <span className="text-gray-900">{record.heartRate} lpm</span>
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(record.heartRateStatus || '')}`}>
                                {record.heartRateStatus}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {record.notes && (
                            <span className="text-xs text-gray-500 truncate max-w-xs block">
                              {record.notes}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="mx-auto text-gray-300" size={48} />
                <p className="text-gray-600 mt-2">No hay registros de salud</p>
              </div>
            )}

            {/* Gráficos de Evolución */}
            {healthRecords.length > 0 && (
              <HealthCharts healthRecords={healthRecords} />
            )}
          </div>

          {/* New Health Record Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Nuevo Registro de Salud</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newRecord.recordDate}
                    onChange={(e) => setNewRecord({...newRecord, recordDate: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Glucemia (g)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newRecord.glucoseLevel}
                      onChange={(e) => setNewRecord({...newRecord, glucoseLevel: e.target.value})}
                      placeholder="1.10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newRecord.weight}
                      onChange={(e) => setNewRecord({...newRecord, weight: e.target.value})}
                      placeholder="70.5"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Tensión Máx</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newRecord.bloodPressureSystolic}
                      onChange={(e) => setNewRecord({...newRecord, bloodPressureSystolic: e.target.value})}
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Tensión Mín</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newRecord.bloodPressureDiastolic}
                      onChange={(e) => setNewRecord({...newRecord, bloodPressureDiastolic: e.target.value})}
                      placeholder="80"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Latidos (lpm)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newRecord.heartRate}
                    onChange={(e) => setNewRecord({...newRecord, heartRate: e.target.value})}
                    placeholder="85"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Notas (opcional)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
                
                <button
                  onClick={handleCreateHealthRecord}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Guardar Registro
                </button>
              </div>
            </div>

            {/* Health Alerts */}
            {healthStats && healthStats.lastRecord && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Alertas de Salud</h3>
                <div className="space-y-3">
                  {healthStats.lastRecord.glucoseStatus && healthStats.lastRecord.glucoseStatus !== 'normal' && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <Bell className="text-red-600" size={20} />
                      <div>
                        <p className="text-sm font-medium text-red-900">Glucemia {healthStats.lastRecord.glucoseStatus}</p>
                        <p className="text-xs text-red-700">{healthStats.lastRecord.glucoseLevel}g</p>
                      </div>
                    </div>
                  )}
                  
                  {healthStats.lastRecord.bloodPressureStatus && 
                   healthStats.lastRecord.bloodPressureStatus !== 'normal' && 
                   healthStats.lastRecord.bloodPressureStatus !== 'ideal' && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <Bell className="text-red-600" size={20} />
                      <div>
                        <p className="text-sm font-medium text-red-900">Tensión {healthStats.lastRecord.bloodPressureStatus}</p>
                        <p className="text-xs text-red-700">
                          {healthStats.lastRecord.bloodPressureSystolic}/{healthStats.lastRecord.bloodPressureDiastolic}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {healthStats.lastRecord.heartRateStatus && healthStats.lastRecord.heartRateStatus !== 'normal' && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Bell className="text-yellow-600" size={20} />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Frecuencia cardíaca {healthStats.lastRecord.heartRateStatus}</p>
                        <p className="text-xs text-yellow-700">{healthStats.lastRecord.heartRate} lpm</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de Compras</h2>
          
          {purchaseHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aplicado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendiente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado Venta</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado Pago</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchaseHistory.map((purchase: any) => {
                    const total = safeNumber(purchase.total);
                    const applied = safeNumber(purchase.amount_applied || 0);
                    const pending = safeNumber(purchase.amount_pending || total - applied);
                    const paymentStatus = purchase.payment_status || 'pending';
                    const saleStatus = purchase.sale_status || 'pending';
                    
                    const paymentConfig = getPaymentStatusConfig(paymentStatus);
                    const saleConfig = getSaleStatusConfig(saleStatus);
                    
                    return (
                      <tr key={purchase.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {purchase.created_at ? new Date(purchase.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {purchase.sale_number || `V-${purchase.id || 'N/A'}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                          {formatCurrency(total)}€
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-medium text-green-600">
                            {formatCurrency(applied)}€
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-medium ${pending > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {pending > 0 ? `${formatCurrency(pending)}€` : '0.00€'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${saleConfig.color}`}>
                            {saleConfig.text}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${paymentConfig.color}`}>
                            <span className="mr-1.5">{paymentConfig.icon}</span>
                            <span>
                              {paymentConfig.text}
                              {purchase.payment_method === 'credit' && pending > 0 && (
                                <span className="ml-1 text-xs opacity-75">
                                  ({formatCurrency(pending)}€)
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${
                            purchase.payment_method === 'credit' ? 'text-yellow-600' :
                            purchase.payment_method === 'cash' ? 'text-green-600' :
                            purchase.payment_method === 'Credit Card' ? 'text-blue-600' :
                            purchase.payment_method === 'Bank Transfer' ? 'text-purple-600' :
                            purchase.payment_method === 'Bank Cheque' ? 'text-indigo-600' :
                            purchase.payment_method === 'mixed' ? 'text-orange-600' :
                            'text-gray-600'
                          }`}>
                            {getPaymentMethodText(purchase.payment_method)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/sales/${purchase.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          >
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto text-gray-300" size={48} />
              <p className="text-gray-600 mt-2">No hay historial de compras</p>
              <button 
                onClick={() => navigate('/sales')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Crear primera venta
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientDetailPage;