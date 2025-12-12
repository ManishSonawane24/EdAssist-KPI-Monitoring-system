import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    TrafficLineChart,
    PerformanceBarChart,
    TrafficSourcePieChart,
    DeviceDoughnutChart,
    CampaignMultiLineChart,
    CTRImpressionChart,
    ConversionFunnelChart,
} from '../components/charts';
import { SectionHeader } from '../components/SectionHeader';
import Logo from '../components/Logo';

/**
 * ChartsPage - Comprehensive Chart.js visualization dashboard
 * 
 * This page demonstrates all the Chart.js visualizations for:
 * - Traffic (GA)
 * - Search performance (GSC)
 * - User activity & applicants
 * - Campaign performance
 * - CTR, impressions, top pages, devices, conversions
 */
export default function ChartsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        setTimeout(() => setLoading(false), 500);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Sample data for Traffic (GA)
    const trafficData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Sessions',
                data: [1200, 1900, 1500, 2100, 2400, 1800, 1600],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
            },
            {
                label: 'Page Views',
                data: [3200, 4100, 3800, 4500, 5200, 3900, 3400],
                borderColor: 'rgb(236, 72, 153)',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
            },
        ],
    };

    // Sample data for Search Performance (GSC)
    const searchPerformanceData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Clicks',
                data: [450, 520, 610, 680],
            },
            {
                label: 'Impressions',
                data: [8500, 9200, 10100, 11300],
            },
        ],
    };

    // Sample data for User Activity & Applicants
    const userActivityData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Active Users',
                data: [2400, 2800, 3200, 3600, 4100, 4500],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
            },
            {
                label: 'Applicants',
                data: [180, 220, 280, 340, 410, 480],
                borderColor: 'rgb(251, 146, 60)',
                backgroundColor: 'rgba(251, 146, 60, 0.1)',
            },
        ],
    };

    // Sample data for Campaign Performance
    const campaignData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
            {
                label: 'Email Campaign',
                data: [320, 380, 420, 460, 510, 580],
                borderColor: 'rgb(99, 102, 241)',
            },
            {
                label: 'Social Media',
                data: [280, 340, 390, 450, 520, 600],
                borderColor: 'rgb(236, 72, 153)',
            },
            {
                label: 'Paid Ads',
                data: [410, 480, 520, 590, 650, 720],
                borderColor: 'rgb(34, 197, 94)',
            },
        ],
    };

    // Sample data for CTR & Impressions
    const ctrImpressionData = {
        labels: ['Google Ads', 'Facebook', 'LinkedIn', 'Twitter', 'Instagram'],
        datasets: [
            {
                label: 'Impressions',
                data: [45000, 38000, 28000, 22000, 35000],
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                yAxisID: 'y',
            },
            {
                label: 'CTR (%)',
                data: [3.2, 2.8, 4.1, 2.3, 3.5],
                backgroundColor: 'rgba(236, 72, 153, 0.8)',
                yAxisID: 'y1',
            },
        ],
    };

    // Sample data for Traffic Sources
    const trafficSourcesData = {
        labels: ['Organic Search', 'Direct', 'Social Media', 'Referral', 'Email', 'Paid Ads'],
        datasets: [
            {
                data: [4200, 2800, 1900, 1200, 850, 1500],
            },
        ],
    };

    // Sample data for Top Pages
    const topPagesData = {
        labels: ['/home', '/jobs', '/about', '/contact', '/blog'],
        datasets: [
            {
                label: 'Page Views',
                data: [8500, 6200, 3800, 2900, 4100],
            },
        ],
    };

    // Sample data for Devices
    const devicesData = {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [
            {
                data: [5200, 7800, 1400],
            },
        ],
    };

    // Sample data for Conversion Funnel
    const conversionFunnelData = {
        labels: ['Visitors', 'Sign Ups', 'Job Views', 'Applications', 'Conversions'],
        datasets: [
            {
                label: 'Users',
                data: [10000, 4500, 2800, 1200, 450],
            },
        ],
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 dark:text-slate-300 font-medium animate-pulse">Loading Charts...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-24">
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-brand-600 to-brand-400 text-white p-2 rounded-xl shadow-lg shadow-brand-200 dark:from-slate-700 dark:to-slate-600">
                            <Logo bare className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                EdAssist <span className="text-brand-600">Charts</span>
                            </h1>
                            <p className="text-xs text-slate-400 dark:text-slate-300 font-medium">Chart.js Visualizations</p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="ml-4 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
                        >
                            ← Dashboard
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{user?.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-300">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                {/* Traffic (GA) */}
                <section className="animate-slideUp" style={{ animationDelay: '0ms' }}>
                    <SectionHeader title="Traffic Analytics (GA)" colorClass="bg-indigo-500" />
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300">
                        <div className="h-80">
                            <TrafficLineChart data={trafficData} title="Weekly Traffic Overview" />
                        </div>
                    </div>
                </section>

                {/* Search Performance (GSC) */}
                <section className="animate-slideUp" style={{ animationDelay: '100ms' }}>
                    <SectionHeader title="Search Performance (GSC)" colorClass="bg-emerald-500" />
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300">
                        <div className="h-80">
                            <PerformanceBarChart data={searchPerformanceData} title="Monthly Search Metrics" />
                        </div>
                    </div>
                </section>

                {/* User Activity & Applicants */}
                <section className="animate-slideUp" style={{ animationDelay: '200ms' }}>
                    <SectionHeader title="User Activity & Applicants" colorClass="bg-violet-500" />
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300">
                        <div className="h-80">
                            <TrafficLineChart data={userActivityData} title="User Engagement Trends" />
                        </div>
                    </div>
                </section>

                {/* Campaign Performance */}
                <section className="animate-slideUp" style={{ animationDelay: '300ms' }}>
                    <SectionHeader title="Campaign Performance" colorClass="bg-rose-500" />
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300">
                        <div className="h-80">
                            <CampaignMultiLineChart data={campaignData} title="Multi-Channel Campaign Comparison" />
                        </div>
                    </div>
                </section>

                {/* CTR & Impressions */}
                <section className="animate-slideUp" style={{ animationDelay: '400ms' }}>
                    <SectionHeader title="CTR & Impressions" colorClass="bg-orange-500" />
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300">
                        <div className="h-80">
                            <CTRImpressionChart data={ctrImpressionData} title="Platform Performance Metrics" />
                        </div>
                    </div>
                </section>

                {/* Grid Layout for Smaller Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Traffic Sources */}
                    <section className="animate-slideUp" style={{ animationDelay: '500ms' }}>
                        <SectionHeader title="Traffic Sources" colorClass="bg-blue-500" />
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300">
                            <div className="h-80">
                                <TrafficSourcePieChart data={trafficSourcesData} title="Traffic Distribution" />
                            </div>
                        </div>
                    </section>

                    {/* Devices */}
                    <section className="animate-slideUp" style={{ animationDelay: '600ms' }}>
                        <SectionHeader title="Device Breakdown" colorClass="bg-cyan-500" />
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300">
                            <div className="h-80">
                                <DeviceDoughnutChart data={devicesData} title="Device Usage" />
                            </div>
                        </div>
                    </section>

                    {/* Top Pages */}
                    <section className="animate-slideUp" style={{ animationDelay: '700ms' }}>
                        <SectionHeader title="Top Pages" colorClass="bg-purple-500" />
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300">
                            <div className="h-80">
                                <PerformanceBarChart data={topPagesData} title="Most Visited Pages" horizontal />
                            </div>
                        </div>
                    </section>

                    {/* Conversion Funnel */}
                    <section className="animate-slideUp" style={{ animationDelay: '800ms' }}>
                        <SectionHeader title="Conversion Funnel" colorClass="bg-pink-500" />
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300">
                            <div className="h-80">
                                <ConversionFunnelChart data={conversionFunnelData} title="User Journey" />
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
        </div>
    );
}
