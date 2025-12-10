import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TrafficSourcePieChartProps {
    data: {
        labels: string[];
        datasets: {
            data: number[];
            backgroundColor?: string[];
            borderColor?: string[];
        }[];
    };
    title?: string;
}

export const TrafficSourcePieChart: React.FC<TrafficSourcePieChartProps> = ({ data, title }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                    },
                    generateLabels: (chart: any) => {
                        const datasets = chart.data.datasets;
                        return chart.data.labels.map((label: string, i: number) => {
                            const value = datasets[0].data[i];
                            const total = datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return {
                                text: `${label} (${percentage}%)`,
                                fillStyle: datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i,
                            };
                        });
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
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const defaultColors = [
        'rgba(14, 165, 233, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(244, 63, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(34, 197, 94, 0.8)',
    ];

    const defaultBorderColors = [
        'rgb(14, 165, 233)',
        'rgb(99, 102, 241)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)',
        'rgb(244, 63, 94)',
        'rgb(251, 146, 60)',
        'rgb(34, 197, 94)',
    ];

    const chartData = {
        labels: data.labels,
        datasets: data.datasets.map((dataset) => ({
            ...dataset,
            backgroundColor: dataset.backgroundColor || defaultColors,
            borderColor: dataset.borderColor || defaultBorderColors,
            borderWidth: 2,
            hoverOffset: 15,
        })),
    };

    return (
        <div className="w-full h-full">
            <Pie options={options} data={chartData} />
        </div>
    );
};
