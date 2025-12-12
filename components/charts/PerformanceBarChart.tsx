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

interface PerformanceBarChartProps {
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor?: string | string[];
            borderColor?: string | string[];
        }[];
    };
    title?: string;
    horizontal?: boolean;
}

export const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({
    data,
    title,
    horizontal = false
}) => {
    const options = {
        indexAxis: horizontal ? ('y' as const) : ('x' as const),
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                    },
                },
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
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null || context.parsed.x !== null) {
                            const value = horizontal ? context.parsed.x : context.parsed.y;
                            label += value.toLocaleString();
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            y: {
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
                        return horizontal ? value : value.toLocaleString();
                    },
                },
            },
            x: {
                grid: {
                    display: horizontal,
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    callback: function (value: any) {
                        return horizontal ? value.toLocaleString() : value;
                    },
                },
            },
        },
    };

    const chartData = {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            backgroundColor: dataset.backgroundColor || [
                'rgba(14, 165, 233, 0.8)',
                'rgba(99, 102, 241, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(244, 63, 94, 0.8)',
            ],
            borderColor: dataset.borderColor || [
                'rgb(14, 165, 233)',
                'rgb(99, 102, 241)',
                'rgb(139, 92, 246)',
                'rgb(236, 72, 153)',
                'rgb(244, 63, 94)',
            ],
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
        })),
    };

    return (
        <div className="w-full h-full">
            <Bar options={options} data={chartData} />
        </div>
    );
};
