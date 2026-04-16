import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService, User, Pharmacy } from '../../services/admin.service';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const GlobalUsersPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'EMPLOYEE' as 'ADMIN' | 'EMPLOYEE',
    pharmacy_id: null as number | null,
    password: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [users, pharmacies] = await Promise.all([
        adminService.getUsers(),
        adminService.getPharmacies()
      ]);
      setUsers(users);
      setPharmacies(pharmacies);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        pharmacy_id: formData.role === 'EMPLOYEE' ? formData.pharmacy_id : null,
        is_active: formData.is_active,
        ...(editingUser ? {} : { password: formData.password })
      };
      
      if (editingUser) {
        await adminService.updateUser(editingUser.id, payload);
      } else {
        await adminService.createUser(payload);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(t('adminUsers.save_error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('adminUsers.confirm_delete'))) return;
    try {
      await adminService.deleteUser(id);
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(t('adminUsers.delete_error'));
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      full_name: '',
      role: 'EMPLOYEE',
      pharmacy_id: null,
      password: '',
      is_active: true
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      role: user.role as 'ADMIN' | 'EMPLOYEE',
      pharmacy_id: user.pharmacy_id,
      password: '',
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      EMPLOYEE: 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      SUPER_ADMIN: t('adminUsers.super_admin'),
      ADMIN: t('adminUsers.admin'),
      EMPLOYEE: t('adminUsers.employee')
    };
    return names[role] || role;
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
            <h1 className="text-2xl font-bold text-gray-900">{t('adminUsers.title')}</h1>
            <p className="text-gray-600 mt-1">{t('adminUsers.subtitle')}</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            {t('adminUsers.new_user')}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.email')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminUsers.full_name')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminUsers.role')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminUsers.pharmacy')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminUsers.status')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.full_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.pharmacy?.name || (user.role === 'SUPER_ADMIN' ? t('adminUsers.global') : t('adminUsers.unassigned'))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? t('adminUsers.active') : t('adminUsers.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      {user.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      )}
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
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingUser ? t('adminUsers.edit_user') : t('adminUsers.new_user')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')} *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminUsers.full_name')} *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminUsers.password')} *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminUsers.role')}</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'EMPLOYEE' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ADMIN">{t('adminUsers.role_admin')}</option>
                    <option value="EMPLOYEE">{t('adminUsers.role_employee')}</option>
                  </select>
                </div>
                {formData.role !== 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminUsers.pharmacy')}</label>
                    <select
                      value={formData.pharmacy_id || ''}
                      onChange={(e) => setFormData({ ...formData, pharmacy_id: parseInt(e.target.value) || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('adminUsers.select_pharmacy')}</option>
                      {pharmacies.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">{t('adminUsers.active')}</label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingUser ? t('common.update') : t('common.create')}
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