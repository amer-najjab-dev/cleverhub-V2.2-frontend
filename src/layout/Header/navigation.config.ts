export type UserRole = 'admin' | 'employee' | 'pharmacist';

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  roles: UserRole[];
  description?: string;
}

export const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: 'Home',
    roles: ['admin', 'employee', 'pharmacist'],
    description: 'Vista general y KPIs'
  },
  {
    label: 'Ventas',
    path: '/sales',
    icon: 'ShoppingCart',
    roles: ['admin', 'employee', 'pharmacist'],
    description: 'Punto de venta y carrito'
  },
  {
    label: 'Clientes',
    path: '/clients',
    icon: 'Users',
    roles: ['admin', 'employee'],
    description: 'Gestión de clientes y deudas'
  },
  {
    label: 'Productos',
    path: '/products',
    icon: 'Package',
    roles: ['admin', 'employee'],
    description: 'Catálogo y precios'
  },
  {
    label: 'Stock',
    path: '/stock',
    icon: 'ClipboardCheck',
    roles: ['admin'],
    description: 'Control de inventario'
  },
  {
    label: 'Proveedores',
    path: '/suppliers',
    icon: 'Truck',
    roles: ['admin'],
    description: 'Recepciones y pagos'
  },
  {
    label: 'Reportes',
    path: '/reports',
    icon: 'BarChart3',
    roles: ['admin'],
    description: 'Análisis y exportación'
  },
  {
    label: 'Admin',
    path: '/admin',
    icon: 'Settings',
    roles: ['admin'],
    description: 'Usuarios y configuración'
  }
];
