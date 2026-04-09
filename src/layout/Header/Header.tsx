import { Link, useLocation } from 'react-router-dom';
import { 
  Home, ShoppingCart, Users, Package, ClipboardCheck, 
  Truck, BarChart3, Bell, LogOut, User, Settings, ChevronDown, Store,
  CreditCard, Activity, FileText, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { RegionSelector } from '../../components/RegionSelector';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { moduleService, Module } from '../../services/module.service';

// Mapa de iconos
const iconMap: Record<string, React.ComponentType<any>> = {
  Home: Home,
  ShoppingCart: ShoppingCart,
  Users: Users,
  Package: Package,
  ClipboardCheck: ClipboardCheck,
  Truck: Truck,
  BarChart3: BarChart3,
  Store: Store,
  LayoutDashboard: Home,
  Settings: Settings,
  FileText: FileText,
  Box: Package,
  CreditCard: CreditCard,
  Activity: Activity,
  Bell: Bell
};

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, logout } = useAuth();

  // Cargar módulos según el rol del usuario
  useEffect(() => {
    const loadModules = async () => {
      if (!user) return;
      try {
        const data = await moduleService.getModules();
        setModules(data);
      } catch (error) {
        console.error('Error loading modules:', error);
      } finally {
        setLoading(false);
      }
    };
    loadModules();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) return null;

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

  // Mostrar loading mientras se cargan los módulos
  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl"></div>
              <span className="font-bold text-gray-900 text-lg lg:text-xl hidden sm:inline">CleverHub</span>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex justify-between items-center h-14 lg:h-16">
          {/* Logo */}
           <Link to="/" className="flex items-center space-x-2 shrink-0 group">
        <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs lg:text-sm">CH</span>
            </div>
             <span className="font-bold text-gray-900 text-base lg:text-lg hidden sm:inline">CleverHub</span>
          </Link>

          {/* Desktop Navigation (xl+) */}
          <nav className="hidden xl:flex items-center justify-center flex-1 mx-6 2xl:mx-10">
            <div className="flex items-center space-x-1 2xl:space-x-2">
              {modules.map((module) => {
                const Icon = iconMap[module.icon] || Home;
                const isActive = isActiveRoute(module.path);
                
                return (
                  <Link
                    key={module.path}
                    to={module.path}
                    className={`flex items-center px-3 2xl:px-4 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap text-sm 2xl:text-base font-medium ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 2xl:w-5 2xl:h-5 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>{module.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Tablet Navigation (lg - xl) - Botón hamburguesa */}
          <div className="hidden lg:block xl:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Menú móvil/tablet desplegable */}
          {mobileMenuOpen && (
            <div className="absolute top-16 lg:top-20 left-0 right-0 bg-white border-b shadow-lg lg:hidden xl:hidden z-50">
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="space-y-2">
                  {modules.map((module) => {
                    const Icon = iconMap[module.icon] || Home;
                    const isActive = isActiveRoute(module.path);
                    
                    return (
                      <Link
                        key={module.path}
                        to={module.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className="text-base font-medium">{module.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Menú derecho */}
          <div className="flex items-center space-x-2 lg:space-x-4 shrink-0">
            {/* Notificaciones */}
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

            {/* Avatar y menú usuario */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 pr-3 rounded-lg hover:bg-gray-50 transition-colors group"
                title="Menú de usuario"
              >
                <div className="w-7 h-7 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
                  {getInitials()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{user.fullName.split(' ')[0]}</p>
                  <p className="text-xs text-gray-400">
                    {user.role === 'ADMIN' ? 'Admin' : user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Empleado'}
                  </p>
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
                    
                    {user.role === 'ADMIN' && (
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

            {/* Selector de región */}
            <div className="hidden sm:block">
              <RegionSelector />
            </div>
          </div>
        </div>

        {/* Navegación móvil (menor que lg) */}
        <div className="lg:hidden pb-3 overflow-x-auto">
          <div className="flex space-x-2">
            {modules.map((module) => {
              const Icon = iconMap[module.icon] || Home;
              const isActive = isActiveRoute(module.path);
              
              return (
                <Link
                  key={module.path}
                  to={module.path}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-16 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{module.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};