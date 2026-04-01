import { useEffect, useState } from 'react';
import { adminService, Pharmacy } from '../../services/admin.service';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const PharmaciesPage = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    license: '',
    address: '',
    phone: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    try {
      const data = await adminService.getPharmacies();
      setPharmacies(data);
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPharmacy) {
        await adminService.updatePharmacy(editingPharmacy.id, formData);
      } else {
        await adminService.createPharmacy(formData);
      }
      setShowModal(false);
      setEditingPharmacy(null);
      setFormData({ name: '', license: '', address: '', phone: '', email: '', is_active: true });
      loadPharmacies();
    } catch (error) {
      console.error('Error saving pharmacy:', error);
      alert('Error al guardar la farmacia');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta farmacia? Se eliminarán todos sus datos.')) return;
    try {
      await adminService.deletePharmacy(id);
      loadPharmacies();
    } catch (error) {
      console.error('Error deleting pharmacy:', error);
      alert('Error al eliminar la farmacia');
    }
  };

  const openEditModal = (pharmacy: Pharmacy) => {
    setEditingPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name,
      license: pharmacy.license,
      address: pharmacy.address || '',
      phone: pharmacy.phone || '',
      email: pharmacy.email || '',
      is_active: pharmacy.is_active
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Farmacias</h1>
            <p className="text-gray-600 mt-1">Administra todas las farmacias de la plataforma</p>
          </div>
          <button
            onClick={() => {
              setEditingPharmacy(null);
              setFormData({ name: '', license: '', address: '', phone: '', email: '', is_active: true });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Farmacia
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
tracking-wider">Licencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase 
tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha 
registro</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase 
tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pharmacies.map((pharmacy) => (
                  <tr key={pharmacy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{pharmacy.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{pharmacy.license}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{pharmacy.phone}</div>
                      <div className="text-sm text-gray-500">{pharmacy.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        pharmacy.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pharmacy.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(pharmacy.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(pharmacy)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(pharmacy.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de creación/edición */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                {editingPharmacy ? 'Editar Farmacia' : 'Nueva Farmacia'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Licencia *</label>
                  <input
                    type="text"
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">Activa</label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingPharmacy ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
