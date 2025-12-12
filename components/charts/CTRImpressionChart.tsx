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

interface CTRImpressionChartProps {
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor?: string;
            borderColor?: string;
            yAxisID?: string;
        }[];
    };
    title?: string;
}

export const CTRImpressionChart: React.FC<CTRImpressionChartProps> = ({ data, title }) => {
    const options = {
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
                        const value = context.parsed.y;
                        if (label.toLowerCase().includes('ctr') || label.toLowerCase().includes('rate')) {
                            label += value.toFixed(2) + '%';
                        } else {
                            label += value.toLocaleString();
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
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
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                beginAtZero: true,
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    callback: function (value: any) {
                        return value.toFixed(1) + '%';
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                },
            },
        },
    };

    const chartData = {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => {
            const isCTR = dataset.label.toLowerCase().includes('ctr') ||
                dataset.label.toLowerCase().includes('rate');

            return {
                ...dataset,
                backgroundColor: dataset.backgroundColor || (isCTR ? 'rgba(236, 72, 153, 0.8)' : 'rgba(99, 102, 241, 0.8)'),
                borderColor: dataset.borderColor || (isCTR ? 'rgb(236, 72, 153)' : 'rgb(99, 102, 241)'),
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
                yAxisID: dataset.yAxisID || (isCTR ? 'y1' : 'y'),
            };
        }),
    };

    return (
        <div className="w-full h-full">
            <Bar options={options} data={chartData} />
        </div>
    );
};
