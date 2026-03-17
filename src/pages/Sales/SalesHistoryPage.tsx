import { SalesHistory } from '../../components/Dashboard/SalesHistory/SalesHistory';

export const SalesHistoryPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Historial Completo de Ventas</h1>
        <SalesHistory />
      </div>
    </div>
  );
};