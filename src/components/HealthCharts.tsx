// src/components/HealthCharts.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Definir la interfaz para un registro de salud
interface HealthRecord {
  id?: number;
  recordDate: string;
  glucoseLevel?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  weight?: number;
  heartRate?: number;
  glucoseStatus?: string;
  bloodPressureStatus?: string;
  heartRateStatus?: string;
  notes?: string;
}

// Props del componente
interface HealthChartsProps {
  healthRecords: HealthRecord[];
}

const HealthCharts: React.FC<HealthChartsProps> = ({ healthRecords = [] }) => {
  // Validar que haya datos
  if (!healthRecords || healthRecords.length === 0) {
    return (
      <div className="health-charts mt-8 p-6 bg-white rounded-xl shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">📈 Gráficos de Evolución</h3>
        <p className="text-gray-600">No hay datos suficientes para mostrar gráficos.</p>
      </div>
    );
  }

  // Filtrar y ordenar registros por fecha (más antiguo primero)
  const validRecords = healthRecords.filter(record => 
    record.recordDate && 
    (record.glucoseLevel || record.bloodPressureSystolic || record.weight || record.heartRate)
  );
  
  if (validRecords.length === 0) {
    return (
      <div className="health-charts mt-8 p-6 bg-white rounded-xl shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">📈 Gráficos de Evolución</h3>
        <p className="text-gray-600">No hay datos suficientes para mostrar gráficos.</p>
      </div>
    );
  }

  const sortedHistorial = [...validRecords].sort((a, b) => {
    const dateA = new Date(a.recordDate);
    const dateB = new Date(b.recordDate);
    return dateA.getTime() - dateB.getTime();
  });

  // Preparar datos para gráficos
  const dates = sortedHistorial.map(h => 
    new Date(h.recordDate).toLocaleDateString('es-ES')
  );
  
  const glucemia = sortedHistorial.map(h => h.glucoseLevel || null);
  const tensionMax = sortedHistorial.map(h => h.bloodPressureSystolic || null);
  const tensionMin = sortedHistorial.map(h => h.bloodPressureDiastolic || null);
  const peso = sortedHistorial.map(h => h.weight || null);
  const latidos = sortedHistorial.map(h => h.heartRate || null);

  // Configuración común
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolución Temporal'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fecha'
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Valor'
        }
      }
    }
  };

  // Gráfico de Glucemia
  const glucemiaChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Glucemia (g/L)',
        data: glucemia,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4
      },
      {
        label: 'Límite Normal (1.10 g/L)',
        data: Array(dates.length).fill(1.10),
        borderColor: 'rgb(75, 192, 192)',
        borderDash: [5, 5],
        borderWidth: 1,
        fill: false,
        pointRadius: 0
      }
    ]
  };

  // Gráfico de Tensión
  const tensionChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Tensión Máxima',
        data: tensionMax,
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4
      },
      {
        label: 'Tensión Mínima',
        data: tensionMin,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4
      },
      {
        label: 'Máxima Ideal (12)',
        data: Array(dates.length).fill(12),
        borderColor: 'rgba(255, 159, 64, 0.3)',
        borderDash: [3, 3],
        borderWidth: 1,
        fill: false,
        pointRadius: 0
      },
      {
        label: 'Mínima Ideal (7)',
        data: Array(dates.length).fill(7),
        borderColor: 'rgba(54, 162, 235, 0.3)',
        borderDash: [3, 3],
        borderWidth: 1,
        fill: false,
        pointRadius: 0
      }
    ]
  };

  // Gráfico de Peso
  const pesoChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Peso (kg)',
        data: peso,
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4
      }
    ]
  };

  // Gráfico de Latidos
  const latidosChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Latidos (lpm)',
        data: latidos,
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgba(255, 205, 86, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4
      },
      {
        label: 'Normal (85 lpm)',
        data: Array(dates.length).fill(85),
        borderColor: 'rgb(75, 192, 192)',
        borderDash: [5, 5],
        borderWidth: 1,
        fill: false,
        pointRadius: 0
      }
    ]
  };

  return (
    <div className="health-charts mt-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Evolución de Salud</h3>
        <p className="text-gray-600 mb-6">
          Gráficos que muestran la evolución temporal de los indicadores de salud.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Glucemia */}
          {glucemia.some(val => val !== null) && (
            <div className="chart-container">
              <h4 className="font-medium text-gray-900 mb-3">Glucemia</h4>
              <div className="h-64">
                <Line data={glucemiaChartData} options={commonOptions} />
              </div>
            </div>
          )}
          
          {/* Tensión */}
          {(tensionMax.some(val => val !== null) || tensionMin.some(val => val !== null)) && (
            <div className="chart-container">
              <h4 className="font-medium text-gray-900 mb-3">Tensión Arterial</h4>
              <div className="h-64">
                <Line data={tensionChartData} options={commonOptions} />
              </div>
            </div>
          )}
          
          {/* Peso */}
          {peso.some(val => val !== null) && (
            <div className="chart-container">
              <h4 className="font-medium text-gray-900 mb-3">Peso</h4>
              <div className="h-64">
                <Line data={pesoChartData} options={commonOptions} />
              </div>
            </div>
          )}
          
          {/* Latidos */}
          {latidos.some(val => val !== null) && (
            <div className="chart-container">
              <h4 className="font-medium text-gray-900 mb-3">Latidos</h4>
              <div className="h-64">
                <Line data={latidosChartData} options={commonOptions} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthCharts;