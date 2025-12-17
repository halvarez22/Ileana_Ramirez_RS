import React, { useEffect, useRef } from 'react';
import { Client } from '../../types';

declare const Chart: any;

interface ClientStatusDoughnutChartProps {
    clients: Client[];
}

const ClientStatusDoughnutChart: React.FC<ClientStatusDoughnutChartProps> = ({ clients }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const statusCounts = clients.reduce((acc, client) => {
            acc[client.status] = (acc[client.status] || 0) + 1;
            return acc;
        }, {} as Record<Client['status'], number>);

        const chartData = {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Clientes',
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#3B82F6', // blue-500 (Lead)
                    '#6366F1', // indigo-500 (Contactado)
                    '#10B981', // green-500 (Activo)
                    '#F59E0B', // yellow-500 (En espera)
                    '#6B7280', // gray-500 (Descartado)
                ],
                borderColor: '#FFFFFF',
                borderWidth: 2,
            }]
        };

        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Inter, sans-serif'
                            }
                        }
                    },
                    tooltip: {
                         bodyFont: {
                            family: 'Inter, sans-serif'
                        },
                         titleFont: {
                            family: 'Inter, sans-serif'
                        }
                    }
                },
                cutout: '60%',
            }
        });
        
        // Cleanup function
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };

    }, [clients]);

    return (
        <div className="relative h-64 md:h-72">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default ClientStatusDoughnutChart;