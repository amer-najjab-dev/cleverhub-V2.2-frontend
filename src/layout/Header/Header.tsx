import { Link, useLocation } from 'react-router-dom';
import { 
  Home, ShoppingCart, Users, Package, ClipboardCheck, 
  Truck, BarChart3, Bell, LogOut, User, Settings, ChevronDown
} from 'lucide-react';
import { navigation } from './navigation.config';
import { useState } from 'react';
import { RegionSelector } from '../../components/RegionSelector';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const iconMap: Record<string, React.ComponentType<any>> = {
  Home,           // Dashboard
  ShoppingCart,   // Ventas
  Users,          // Clientes
  Package,        // Productos
  ClipboardCheck, // Stock
  Truck,          // Proveedores
  BarChart3       // Reportes
};

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) return null;

  const filteredNav = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  // Array con los 7 items de navegación
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'Home', description: 'Panel principal' },
    { path: '/sales', label: 'Ventas', icon: 'ShoppingCart', description: 'Punto de venta' },
    { path: '/clients', label: 'Clientes', icon: 'Users', description: 'Gestión de clientes' },
    { path: '/products', label: 'Productos', icon: 'Package', description: 'Catálogo de productos' },
    { path: '/stock', label: 'Stock', icon: 'ClipboardCheck', description: 'Inventario' },
    { path: '/providers', label: 'Proveedores', icon: 'Truck', description: 'Gestión de proveedores' },
    { path: '/reports', label: 'Reportes', icon: 'BarChart3', description: 'Informes y estadísticas' }
  ].filter(item => {
    const exists = filteredNav.some(nav => {
      const navPath = nav.path.replace(/^\//, '');
      const itemPath = item.path.replace(/^\//, '');
      return navPath === itemPath || 
             (itemPath === '' && navPath === 'dashboard') ||
             (itemPath === 'dashboard' && navPath === '');
    });
    
    // Forzar inclusión de Proveedores
    if (item.path === '/providers' && !exists) {
      return true;
    }
    
    return exists;
  });

  const getInitials = () => {
    const nameParts = user.fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return user.fullName.charAt(0).toUpperCase();
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex justify-between items-center h-15"> {/* Altura intermedia */}
          {/* 1. CH CleverHub - tamaño intermedio */}
          <Link to="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-sm">CH</span>
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:inline group-hover:text-blue-600 transition-colors">CleverHub</span>
          </Link>

          {/* 2-8. Items de navegación - tamaño intermedio */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-4">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const isActive = isActiveRoute(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-sm font-medium ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={item.description}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* 9-11. Menú derecho - tamaño intermedio */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* 9. Campana */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-50 relative group"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-5 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">Notificaciones</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-5 py-3 hover:bg-gray-50 transition-colors">
                      <p className="text-sm font-medium text-gray-900">Stock bajo: Paracetamol</p>
                      <p className="text-xs text-gray-500 mt-0.5">Quedan 12 unidades</p>
                    </div>
                    <div className="px-5 py-3 hover:bg-gray-50 transition-colors border-t border-gray-50">
                      <p className="text-sm font-medium text-gray-900">Caducidad próxima</p>
                      <p className="text-xs text-gray-500 mt-0.5">Ibuprofeno vence en 30 días</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 10. Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 pr-3 rounded-lg hover:bg-gray-50 transition-colors group"
                title="Menú de usuario"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
                  {getInitials()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{user.fullName.split(' ')[0]}</p>
                  <p className="text-xs text-gray-400">{user.role === 'admin' ? 'Admin' : 'Empleado'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                  <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  
                  <div className="py-1.5">
                    <Link
                      to="/profile"
                      className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 mr-3 text-gray-500" />
                      <span>Mi perfil</span>
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link
                        to="/admin/users"
                        className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                        <span>Usuarios</span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 11. Maroc MAD */}
            <div className="hidden sm:block">
              <RegionSelector />
            </div>
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="md:hidden pb-3 overflow-x-auto">
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-16 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};