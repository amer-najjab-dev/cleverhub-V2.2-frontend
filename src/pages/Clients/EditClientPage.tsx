import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clientsService } from '../../services/clients.service';

const EditClientPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dni: '',
    address: '',
    birth_date: '',
    allergies: [] as string[],
    chronic_conditions: [] as string[],
    is_pregnant: false,
    is_lactating: false
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clientId = parseInt(id!);
        const response = await clientsService.getById(clientId);
        const client = response.data;
        
        setFormData({
          first_name: client.first_name || '',
          last_name: client.last_name || '',
          email: client.email || '',
          phone: client.phone || '',
          dni: client.dni || '',
          address: client.address || '',
          birth_date: client.birth_date ? new Date(client.birth_date).toISOString().split('T')[0] : '',
          allergies: client.allergies ? client.allergies.split(',').map((s: string) => s.trim()) : [],
          chronic_conditions: client.chronic_conditions ? client.chronic_conditions.split(',').map((s: string) => s.trim()) : [],
          is_pregnant: client.is_pregnant || false,
          is_lactating: client.is_lactating || false
        });
      } catch (error) {
        console.error('Error fetching client:', error);
        toast.error('Error al cargar los datos del cliente');
        navigate('/clients');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchClient();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'allergies' || name === 'chronic_conditions') {
      // Convertir texto a array separado por comas
      const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
      setFormData(prev => ({
        ...prev,
        [name]: arrayValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const clientId = parseInt(id!);
      
      // Preparar datos para enviar al backend
      const dataToSend = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        dni: formData.dni,
        address: formData.address,
        birth_date: formData.birth_date ? new Date(formData.birth_date).toISOString() : null,
        allergies: formData.allergies.length > 0 ? formData.allergies.join(', ') : null,
        chronic_conditions: formData.chronic_conditions.length > 0 ? formData.chronic_conditions.join(', ') : null,
        is_pregnant: formData.is_pregnant,
        is_lactating: formData.is_lactating
      };
      
      await clientsService.update(clientId, dataToSend);
      toast.success('Cliente actualizado correctamente');
      navigate(`/clients/${clientId}`);
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el cliente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando datos del cliente...</p>
      </div>
    );
  }

  const allergiesText = formData.allergies.join(', ');
  const chronicConditionsText = formData.chronic_conditions.join(', ');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/clients/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Editar Cliente</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/clients/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X size={18} />
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Personal</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI/NIF</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Información Médica */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Médica</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
              <textarea
                name="allergies"
                value={allergiesText}
                onChange={handleChange}
                rows={2}
                placeholder="Ej: Penicilina, Aspirina..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Separa las alergias con comas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condiciones Crónicas</label>
              <textarea
                name="chronic_conditions"
                value={chronicConditionsText}
                onChange={handleChange}
                rows={2}
                placeholder="Ej: Diabetes, Hipertensión..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Separa las condiciones con comas</p>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_pregnant"
                  checked={formData.is_pregnant}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Embarazada</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_lactating"
                  checked={formData.is_lactating}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Lactando</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditClientPage;