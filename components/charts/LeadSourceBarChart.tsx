import React, { useEffect, useRef } from 'react';
import { Client } from '../../types';

declare const Chart: any;

interface LeadSourceBarChartProps {
    clients: Client[];
}

const LeadSourceBarChart: React.FC<LeadSourceBarChartProps> = ({ clients }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const sourceCounts = clients.reduce((acc, client) => {
            const source = client.leadSource || 'Otro';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {} as Record<NonNullable<Client['leadSource']> | 'Otro', number>);

        const chartData = {
            labels: Object.keys(sourceCounts),
            datasets: [{
                label: 'Número de Clientes',
                data: Object.values(sourceCounts),
                backgroundColor: 'rgba(8, 61, 92, 0.7)',
                borderColor: 'rgba(8, 61, 92, 1)',
                borderWidth: 1,
                borderRadius: 4,
            }]
        };

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            display: false,
                        },
                         ticks: {
                            font: { family: 'Inter, sans-serif' },
                            precision: 0
                        }
                    },
                    y: {
                         grid: {
                            display: false,
                        },
                         ticks: {
                            font: { family: 'Inter, sans-serif' }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                     tooltip: {
                         bodyFont: {
                            family: 'Inter, sans-serif'
                        },
                         titleFont: {
                            family: 'Inter, sans-serif'
                        }
                    }
                }
            }
        });
        
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };

    }, [clients]);

    return (
        <div className="relative h-80">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default LeadSourceBarChart;