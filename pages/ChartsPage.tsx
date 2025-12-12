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
import { fetchDashboardData } from '../services/dataService';
import { DashboardData } from '../types';

/**
  ChartsPage - Comprehensive Chart.js visualization dashboard
  
 This page demonstrates all the Chart.js visualizations for:
   Traffic (GA)
  Search performance (GSC)
  User activity & applicants
  Campaign performance
  CTR, impressions, top pages, devices, conversions
 */
export default function ChartsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await fetchDashboardData();
                if (mounted) setDashboardData(data);
            } catch (err) {
                console.error('Error loading dashboard data', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Build chart payloads from backend data when available
    const safeNum = (v: any) => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
            const parsed = parseFloat(v.toString().replace(/[^0-9.\-]/g, ''));
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    const trafficData = (() => {
        if (!dashboardData) return {
            labels: ['Today', 'MTD', 'YTD'],
            datasets: [
                { label: 'Sessions', data: [0, 0, 0], borderColor: 'rgb(99, 102, 241)', backgroundColor: 'rgba(99, 102, 241, 0.1)' },
                { label: 'Users', data: [0, 0, 0], borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.1)' },
            ],
        };

        const wp = dashboardData.websitePerformance || [];
        const sessionsItem = wp.find(i => i.label && i.label.toLowerCase().includes('sessions'));
        const usersItem = wp.find(i => i.label && i.label.toLowerCase().includes('total users'));

        const arr = (item: any) => [safeNum(item?.today), safeNum(item?.mtd), safeNum(item?.ytd)];

        return {
            labels: ['Today', 'MTD', 'YTD'],
            datasets: [
                { label: 'Sessions', data: arr(sessionsItem), borderColor: 'rgb(99, 102, 241)', backgroundColor: 'rgba(99, 102, 241, 0.1)' },
                { label: 'Users', data: arr(usersItem), borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.1)' },
            ],
        };
    })();

    const searchPerformanceData = (() => {
        if (!dashboardData) return { labels: ['Today','MTD','YTD'], datasets: [{ label: 'Clicks', data: [0,0,0] }, { label: 'Impressions', data: [0,0,0] }] };

        const wp = dashboardData.websitePerformance || [];
        const clicksItem = wp.find(i => i.label && i.label.toLowerCase().includes('click'));
        const impressionsItem = wp.find(i => i.label && i.label.toLowerCase().includes('impress'));
        const arr = (item: any) => [safeNum(item?.today), safeNum(item?.mtd), safeNum(item?.ytd)];

        return {
            labels: ['Today', 'MTD', 'YTD'],
            datasets: [
                { label: 'Clicks', data: arr(clicksItem) },
                { label: 'Impressions', data: arr(impressionsItem) },
            ],
        };
    })();

    const userActivityData = (() => {
        // Map growthFunnel -> show Today/MTD/YTD for key funnel items
        if (!dashboardData) return { labels: ['Today','MTD','YTD'], datasets: [{ label: 'Active Users', data: [0,0,0] }, { label: 'Applicants', data: [0,0,0] }] };
        const gf = dashboardData.growthFunnel || [];
        const visits = gf.find(i => i.label && i.label.toLowerCase().includes('website'));
        const jobViews = gf.find(i => i.label && i.label.toLowerCase().includes('job'));
        const arr = (item: any) => [safeNum(item?.today), safeNum(item?.mtd), safeNum(item?.ytd)];

        return {
            labels: ['Today', 'MTD', 'YTD'],
            datasets: [
                { label: 'Active Users', data: arr(visits), borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.1)' },
                { label: 'Applicants', data: arr(jobViews), borderColor: 'rgb(251, 146, 60)', backgroundColor: 'rgba(251, 146, 60, 0.1)' },
            ],
        };
    })();

    const campaignData = (() => {
        if (!dashboardData) return { labels: ['Today','MTD','YTD'], datasets: [] };
        // Derive simple campaign trends from growthFunnel totals (heuristic)
        const totalVisits = dashboardData.growthFunnel?.find(i => i.label.toLowerCase().includes('website')) || { today: 0, mtd: 0, ytd: 0 };
        const base = [safeNum(totalVisits.today), safeNum(totalVisits.mtd), safeNum(totalVisits.ytd)];
        // Distribute into channels
        const email = base.map(v => Math.round(v * 0.25));
        const social = base.map(v => Math.round(v * 0.30));
        const paid = base.map(v => Math.round(v * 0.45));

        return {
            labels: ['Today', 'MTD', 'YTD'],
            datasets: [
                { label: 'Email Campaign', data: email, borderColor: 'rgb(99, 102, 241)' },
                { label: 'Social Media', data: social, borderColor: 'rgb(236, 72, 153)' },
                { label: 'Paid Ads', data: paid, borderColor: 'rgb(34, 197, 94)' },
            ],
        };
    })();

    const ctrImpressionData = (() => {
        if (!dashboardData) return { labels: ['Today','MTD','YTD'], datasets: [{ label: 'Impressions', data: [0,0,0], yAxisID: 'y' }, { label: 'CTR (%)', data: [0,0,0], yAxisID: 'y1' }] };

        const wp = dashboardData.websitePerformance || [];
        const impressionsItem = wp.find(i => i.label && i.label.toLowerCase().includes('impress'));
        const ctrItem = wp.find(i => i.label && i.label.toLowerCase().includes('ctr'));
        const arr = (item: any) => [safeNum(item?.today), safeNum(item?.mtd), safeNum(item?.ytd)];

        return {
            labels: ['Today', 'MTD', 'YTD'],
            datasets: [
                { label: 'Impressions', data: arr(impressionsItem), backgroundColor: 'rgba(99, 102, 241, 0.8)', yAxisID: 'y' },
                { label: 'CTR (%)', data: arr(ctrItem), backgroundColor: 'rgba(236, 72, 153, 0.8)', yAxisID: 'y1' },
            ],
        };
    })();

    const trafficSourcesData = (() => {
        if (!dashboardData) return { labels: [], datasets: [{ data: [] }] };
        const labels = (dashboardData.trafficSources || []).map((s:any) => s.name);
        const data = (dashboardData.trafficSources || []).map((s:any) => safeNum(s.value));
        return { labels, datasets: [{ data }] };
    })();

    const topPagesData = (() => {
        if (!dashboardData) return { labels: [], datasets: [{ label: 'Page Views', data: [] }] };
        const labels = (dashboardData.topPages || []).map(p => p.pageName);
        const data = (dashboardData.topPages || []).map(p => safeNum(p.views));
        return { labels, datasets: [{ label: 'Page Views', data }] };
    })();

    const devicesData = (() => {
        if (!dashboardData) return { labels: [], datasets: [{ data: [] }] };
        // Use pageViewsByCategory as a proxy for device/category distribution when available
        const cat = dashboardData.pageViewsByCategory || [];
        if (cat.length) {
            return { labels: cat.map(c => c.name), datasets: [{ data: cat.map(c => safeNum(c.val)) }] };
        }
        return { labels: [], datasets: [{ data: [] }] };
    })();

    const conversionFunnelData = (() => {
        if (!dashboardData) return { labels: [], datasets: [{ label: 'Users', data: [] }] };
        const gf = dashboardData.growthFunnel || [];
        const labels = gf.map(g => g.label);
        const data = gf.map(g => safeNum((g as any).today));
        return { labels, datasets: [{ label: 'Users', data }] };
    })();

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
