// src/modules/reports/layout/ReportsLayout.tsx - VERSIÓN CORREGIDA
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  BarChart3, 
  Building2, 
  History,
  Pill,
  Users,
  Heart,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

interface TabGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  children: {
    path: string;
    label: string;
    description?: string;
  }[];
}

export const ReportsLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const tabGroups: TabGroup[] = [
    {
      id: 'cash',
      label: 'Caisse',
      icon: Wallet,
      children: [
        { path: '/reports/cash-closure', label: 'Clôture de caisse', description: 'Rapport de fin de journée' }
      ]
    },
    {
      id: 'bi',
      label: 'Analyse',
      icon: BarChart3,
      children: [
        { path: '/reports/bi', label: 'Tableau de bord', description: 'KPIs et tendances' }
      ]
    },
    {
      id: 'suppliers',
      label: 'Fournisseurs',
      icon: Building2,
      children: [
        { path: '/reports/suppliers', label: 'Analyse fournisseurs', description: 'Hypermedic vs Lodimed' }
      ]
    },
    {
      id: 'products',
      label: 'Produits',
      icon: Pill,
      children: [
        { path: '/reports/products', label: 'Rapport produits', description: 'Analyse des ventes par produit' },
        { path: '/reports/products/intelligence', label: 'Intelligence produits', description: 'Prévisions et tendances' },
        { path: '/reports/batches', label: 'Traçabilité lots', description: 'Recherche par lot' }
      ]
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      children: [
        { path: '/reports/clients', label: 'Rapport clients', description: 'Analyse du comportement client' },
        { path: '/reports/debts', label: 'Dettes clients', description: 'Suivi des impayés' }
      ]
    },
    {
      id: 'loyalty',
      label: 'Fidélisation',
      icon: Heart,
      children: [
        { path: '/reports/loyalty', label: 'Programme fidélité', description: 'Points, tiers et suivi' }
      ]
    },
    {
      id: 'connect',
      label: 'Connect',
      icon: MessageSquare,
      children: [
        { path: '/reports/connect', label: 'Campagnes WhatsApp', description: 'Communication client' }
      ]
    },
    {
      id: 'audit',
      label: 'Audit',
      icon: History,
      children: [
        { path: '/reports/audit', label: "Journal d'audit", description: 'Traçabilité des actions' }
      ]
    }
  ];

  const findActiveGroup = () => {
    for (const group of tabGroups) {
      for (const child of group.children) {
        if (location.pathname === child.path) {
          return group.id;
        }
      }
    }
    return null;
  };

  const activeGroup = findActiveGroup();

  const handleButtonClick = (group: TabGroup) => {
    const isCurrentGroupActive = group.children.some(child => location.pathname === child.path);
    
    if (!isCurrentGroupActive) {
      navigate(group.children[0].path);
    }
    
    setOpenGroup(openGroup === group.id ? null : group.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" px-4 sm:px-6 lg:px-8 py-6">
        {/* Barra de navegación */}
        <div className="bg-white rounded-t-xl shadow-2xl border border-gray-200">
          <div className="flex items-center gap-1 p-2 overflow-x-auto">
            {tabGroups.map((group) => {
              const Icon = group.icon;
              const isActive = activeGroup === group.id;
              const isOpen = openGroup === group.id;

              if (group.children.length === 1) {
                return (
                  <NavLink
                    key={group.id}
                    to={group.children[0].path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-600 bg-white shadow-md hover:shadow-xl hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{group.label}</span>
                  </NavLink>
                );
              }

              return (
                <div key={group.id} className="relative">
                  <button
                    onClick={() => handleButtonClick(group)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 bg-white shadow-md hover:shadow-xl hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{group.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-50"
                      onMouseLeave={() => setOpenGroup(null)}
                    >
                      {group.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={() => setOpenGroup(null)}
                          className={({ isActive }) =>
                            `block px-4 py-3 hover:bg-gray-50 transition-colors ${
                              isActive ? 'bg-blue-50' : ''
                            }`
                          }
                        >
                          <div className="text-sm font-medium text-gray-900">{child.label}</div>
                          {child.description && (
                            <div className="text-xs text-gray-500 mt-0.5">{child.description}</div>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-b-lg shadow-2xl border border-gray-200 border-t-0 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};