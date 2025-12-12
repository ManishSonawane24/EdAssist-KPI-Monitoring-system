import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ConversionFunnelChartProps {
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor?: string[];
        }[];
    };
    title?: string;
}

export const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ data, title }) => {
    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold' as const,
                    family: "'Inter', sans-serif",
                },
                padding: {
                    bottom: 20,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 13,
                    weight: 'bold' as const,
                },
                bodyFont: {
                    size: 12,
                },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        const value = context.parsed.x;
                        const total = Math.max(...context.dataset.data);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${value.toLocaleString()} (${percentage}% of total)`;
                    },
                    afterLabel: function (context: any) {
                        if (context.dataIndex > 0) {
                            const currentValue = context.parsed.x;
                            const previousValue = context.dataset.data[context.dataIndex - 1];
                            const dropOff = ((1 - currentValue / previousValue) * 100).toFixed(1);
                            return `Drop-off: ${dropOff}%`;
                        }
                        return '';
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    callback: function (value: any) {
                        return value.toLocaleString();
                    },
                },
            },
            y: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                },
            },
        },
    };

    const gradientColors = [
        'rgba(34, 197, 94, 0.9)',
        'rgba(59, 130, 246, 0.9)',
        'rgba(99, 102, 241, 0.9)',
        'rgba(236, 72, 153, 0.9)',
        'rgba(239, 68, 68, 0.9)',
    ];

    const chartData = {
        labels: data.labels,
        datasets: data.datasets.map((dataset) => ({
            ...dataset,
            backgroundColor: dataset.backgroundColor || gradientColors,
            borderColor: 'rgba(255, 255, 255, 0.8)',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
        })),
    };

    return (
        <div className="w-full h-full">
            <Bar options={options} data={chartData} />
        </div>
    );
};
