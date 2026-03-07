import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Building2, Wallet, History, FileText, Settings } from 'lucide-react';
import { MegaTabContainer } from '../components/MegaTabContainer';
import { supplierService } from '../services/supplier.service';
import { Supplier } from '../types/supplier.types';

// Lazy loading de las pestañas
const GeneralInfoTab = lazy(() => import('../components/tabs/GeneralInfoTab'));
const ContactsTab = lazy(() => import('../components/tabs/ContactsTab'));
const CreditsTab = lazy(() => import('../components/tabs/CreditsTab'));
const DescriptiveInfoTab = lazy(() => import('../components/tabs/DescriptiveInfoTab'));
const PaymentHistoryTab = lazy(() => import('../components/tabs/PaymentHistoryTab'));
const ProductHistoryTab = lazy(() => import('../components/tabs/ProductHistoryTab'));
const PurchaseOrdersTab = lazy(() => import('../components/tabs/PurchaseOrdersTab'));
const DeliveryNotesTab = lazy(() => import('../components/tabs/DeliveryNotesTab'));
const TraceabilityTab = lazy(() => import('../components/tabs/TraceabilityTab'));
const CommentsTab = lazy(() => import('../components/tabs/CommentsTab'));

// Configuración de grupos de pestañas (estilo SFCC) - CORREGIDO: strings en una línea
const tabGroups = [
  {
    id: 'info',
    label: 'Información General',
    icon: Building2,
    tabs: [
      { id: 'general', label: 'Informations générales', description: 'Données de base du fournisseur' },
      { id: 'contacts', label: 'Contacts & Adresses', description: 'Personnes à contacter et adresses' },
    ]
  },
  {
    id: 'financial',
    label: 'Financiero',
    icon: Wallet,
    tabs: [
      { id: 'credits', label: 'Avoirs fournisseurs', description: 'Crédits et notes de crédit' },
      { id: 'payments', label: 'Historique des paiements', description: 'Tous les paiements effectués' },
    ]
  },
  {
    id: 'history',
    label: 'Historial',
    icon: History,
    tabs: [
      { id: 'products', label: 'Historique des produits', description: 'Tracabilité des achats' },
      { id: 'traceability', label: 'Informations de traçabilité', description: 'Création et modifications' },
    ]
  },
  {
    id: 'documents',
    label: 'Documentos',
    icon: FileText,
    tabs: [
      { id: 'orders', label: 'Bons de commandes', description: 'Commandes en cours et passées' },
      { id: 'deliveries', label: 'Bons de livraison', description: 'Réceptions de marchandises' },
      { id: 'descriptive', label: 'Informations descriptives', description: 'Notes et descriptions' },
    ]
  },
  {
    id: 'other',
    label: 'Otros',
    icon: Settings,
    tabs: [
      { id: 'comments', label: 'Commentaires', description: 'Notes internes' },
    ]
  }
];

export const SupplierDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (id) {
      loadSupplier();
    }
  }, [id]);

  const loadSupplier = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getById(id!);
      setSupplier(data);
    } catch (error) {
      console.error('Error loading supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralInfoTab supplierId={id!} />;
      case 'contacts':
        return <ContactsTab supplierId={id!} />;
      case 'credits':
        return <CreditsTab supplierId={id!} />;
      case 'descriptive':
        return <DescriptiveInfoTab supplierId={id!} />;
      case 'payments':
        return <PaymentHistoryTab supplierId={id!} />;
      case 'products':
        return <ProductHistoryTab supplierId={id!} />;
      case 'orders':
        return <PurchaseOrdersTab supplierId={id!} />;
      case 'deliveries':
        return <DeliveryNotesTab supplierId={id!} />;
      case 'traceability':
        return <TraceabilityTab supplierId={id!} />;
      case 'comments':
        return <CommentsTab supplierId={id!} />;
      default:
        return <GeneralInfoTab supplierId={id!} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">Fournisseur non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con navegación */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/providers')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{supplier.companyName}</h1>
            <p className="text-sm text-gray-500">ID: {supplier.id}</p>
          </div>
        </div>

        {/* Balance card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500">Solde actuel</div>
              <div className={`text-2xl font-bold ${supplier.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(supplier.balance)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Crédits disponibles</div>
              <div className="text-2xl font-bold text-blue-600">
                {/* Calcular de créditos - se implementará después */}
                0,00 DHS
              </div>
            </div>
          </div>
        </div>

        {/* Mega contenedor de pestañas */}
        <MegaTabContainer
          groups={tabGroups}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          }>
            {renderTabContent()}
          </Suspense>
        </MegaTabContainer>
      </div>
    </div>
  );
};