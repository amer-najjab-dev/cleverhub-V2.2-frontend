import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface SeasonalityChartProps {
  productName: string;
  seasonalFactors: number[];
  months: string[];
}

export const SeasonalityChart: React.FC<SeasonalityChartProps> = ({ 
  productName, 
  seasonalFactors, 
  months 
}) => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
        }
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
    },
    title: {
      text: `Facteur saisonnier - ${productName}`,
      align: 'left',
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#263238'
      }
    },
    xaxis: {
      categories: months,
      title: {
        text: 'Mois'
      }
    },
    yaxis: {
      title: {
        text: 'Facteur (1.0 = normal)'
      },
      min: 0,
      max: 2.5,
      tickAmount: 5,
      labels: {
        formatter: (value: number) => value.toFixed(1) + 'x'
      }
    },
    colors: ['#3B82F6'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    markers: {
      size: 5,
      hover: {
        size: 7
      }
    },
    tooltip: {
      y: {
        formatter: (value: number) => value.toFixed(2) + 'x la moyenne'
      }
    },
    annotations: {
      yaxis: [{
        y: 1.0,
        borderColor: '#EF4444',
        label: {
          text: 'Moyenne',
          style: {
            color: '#fff',
            background: '#EF4444'
          }
        }
      }]
    },
    grid: {
      borderColor: '#E5E7EB',
      row: {
        colors: ['#F9FAFB', 'transparent'],
        opacity: 0.5
      }
    }
  };

  const series = [{
    name: 'Facteur saisonnier',
    data: seasonalFactors
  }];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <Chart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </div>
  );
};
