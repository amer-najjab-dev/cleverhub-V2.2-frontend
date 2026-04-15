import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, ShoppingCart, Users, Package, ClipboardCheck, 
  Truck, BarChart3, Bell, LogOut, User, Settings, ChevronDown, Store,
  CreditCard, Activity, FileText, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { RegionSelector } from '../../components/RegionSelector';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

// Módulos estáticos según el rol
const getModulesByRole = (role: string | undefined) => {
  const userRole = role?.toUpperCase();
  
  if (userRole === 'SUPER_ADMIN') {
    return [
      { nameKey: 'nav.dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
      { nameKey: 'nav.pharmacies', path: '/admin/pharmacies', icon: 'Store' },
      { nameKey: 'nav.global_users', path: '/admin/users', icon: 'Users' },
      { nameKey: 'nav.subscriptions', path: '/admin/subscriptions', icon: 'CreditCard' },
      { nameKey: 'nav.communication', path: '/admin/broadcast', icon: 'Bell' },
      { nameKey: 'nav.health_signal', path: '/admin/health', icon: 'Activity' },
      { nameKey: 'nav.settings', path: '/settings', icon: 'Settings' }
    ];
  }
  
  if (userRole === 'ADMIN') {
    return [
      { nameKey: 'nav.dashboard', path: '/', icon: 'Home' },
      { nameKey: 'nav.sales', path: '/sales', icon: 'ShoppingCart' },
      { nameKey: 'nav.clients', path: '/clients', icon: 'Users' },
      { nameKey: 'nav.products', path: '/products', icon: 'Package' },
      { nameKey: 'nav.stock', path: '/stock', icon: 'Box' },
      { nameKey: 'nav.suppliers', path: '/providers', icon: 'Truck' },
      { nameKey: 'nav.hr', path: '/hr', icon: 'Users' },
      { nameKey: 'nav.reports', path: '/reports', icon: 'FileText' }
    ];
  }
  
  // EMPLOYEE
  return [
    { nameKey: 'nav.dashboard', path: '/', icon: 'Home' },
    { nameKey: 'nav.sales', path: '/sales', icon: 'ShoppingCart' },
    { nameKey: 'nav.clients', path: '/clients', icon: 'Users' },
    { nameKey: 'nav.products', path: '/products', icon: 'Package' }
  ];
};

export const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageKey, setLanguageKey] = useState(0);
  
  const { user, logout } = useAuth();

  // Forzar re-render cuando cambia el idioma
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageKey(prev => prev + 1);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Cargar módulos según el rol del usuario (estático, sin llamada al backend)
  useEffect(() => {
    if (user) {
      const userModules = getModulesByRole(user.role);
      setModules(userModules);
      setLoading(false);
    }
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
    // Para SUPER_ADMIN, mostrar "SA" en lugar de las iniciales del nombre
    if (user?.role === 'SUPER_ADMIN') {
      return 'SA';
    }
    
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
        <div className="w-full px-4 sm:px-6 lg:px-8">
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
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-sm lg:text-base">CH</span>
            </div>
            <span className="font-bold text-gray-900 text-lg lg:text-xl hidden sm:inline group-hover:text-blue-600 transition-colors">CleverHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-start flex-1 ml-4">
            <div className="flex items-center gap-1 overflow-x-auto lg:overflow-x-visible">
              {modules.map((module, index) => {
                const Icon = iconMap[module.icon] || Home;
                const isActive = isActiveRoute(module.path);
                const displayName = t(module.nameKey, module.nameKey.split('.').pop() || module.nameKey) as string;
                
                return (
                  <Link
                    key={`${module.path}-${languageKey}-${index}`}
                    to={module.path}
                    className={`flex items-center px-2 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-1.5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span>{displayName}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Tablet Navigation (xl+) - Botón hamburguesa para pantallas entre lg y xl */}
          <div className="hidden xl:block 2xl:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Menú móvil/tablet desplegable */}
          {mobileMenuOpen && (
            <div className="absolute top-16 lg:top-20 left-0 right-0 bg-white border-b shadow-lg xl:hidden z-50">
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="space-y-2">
                  {modules.map((module, index) => {
                    const Icon = iconMap[module.icon] || Home;
                    const isActive = isActiveRoute(module.path);
                    const displayName = t(module.nameKey, module.nameKey.split('.').pop() || module.nameKey) as string;
                    
                    return (
                      <Link
                        key={`mobile-${module.path}-${languageKey}-${index}`}
                        to={module.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className="text-base font-medium">{displayName}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Menú derecho */}
          <div className="flex items-center space-x-1 lg:space-x-2 shrink-0">
            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-50 relative group"
                title={t('header.notifications')}
              >
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-5 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">{t('header.notifications_title')}</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-5 py-3 hover:bg-gray-50 transition-colors">
                      <p className="text-sm font-medium text-gray-900">{t('header.low_stock')}: Paracetamol</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t('header.units_left')}: 12</p>
                    </div>
                    <div className="px-5 py-3 hover:bg-gray-50 transition-colors border-t border-gray-50">
                      <p className="text-sm font-medium text-gray-900">{t('header.expiring_soon')}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Ibuprofeno {t('header.expires_in')} 30 {t('header.days')}</p>
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
                title={t('header.user_menu')}
              >
                <div className="w-7 h-7 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
                  {getInitials()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{user.fullName.split(' ')[0]}</p>
                  <p className="text-xs text-gray-400">
                    {user.role === 'ADMIN' ? t('header.admin') : user.role === 'SUPER_ADMIN' ? t('header.super_admin') : t('header.employee')}
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
                      <span>{t('header.my_profile')}</span>
                    </Link>
                    
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/users"
                        className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                        <span>{t('header.users')}</span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span>{t('header.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Selector de región compacto */}
            <div className="hidden sm:block">
              <RegionSelector />
            </div>
          </div>
        </div>

        {/* Navegación móvil (menor que lg) */}
        <div className="lg:hidden pb-3 overflow-x-auto">
          <div className="flex space-x-2">
            {modules.map((module, index) => {
              const Icon = iconMap[module.icon] || Home;
              const isActive = isActiveRoute(module.path);
              const displayName = t(module.nameKey, module.nameKey.split('.').pop() || module.nameKey) as string;
              
              return (
                <Link
                  key={`mobile-bottom-${module.path}-${languageKey}-${index}`}
                  to={module.path}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-16 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{displayName}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};