import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Shield, Calendar, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar actualización de perfil
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 
overflow-hidden">
          {/* Cabecera */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 
py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center 
justify-center">
                <span className="text-3xl font-bold text-blue-600">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{user?.fullName}</h1>
                <p className="text-blue-100">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform 
-translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: 
e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 
rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 
disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform 
-translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: 
e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 
rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 
disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform 
-translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={user?.role}
                    disabled
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 
rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miembro desde
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform 
-translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value="2026"
                    disabled
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 
rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg 
hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg 
hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar cambios
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg 
hover:bg-blue-700"
                >
                  Editar perfil
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
