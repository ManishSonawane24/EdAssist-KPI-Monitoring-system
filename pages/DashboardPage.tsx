import React, { useEffect, useRef, useState } from 'react';
import { fetchDashboardData } from '../services/dataService';
import { DashboardData, KPIMetric } from '../types';
import { MetricCard } from '../components/MetricCard';
import { SectionHeader } from '../components/SectionHeader';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [exportingFormat, setExportingFormat] = useState<'xlsx' | 'csv' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchDashboardData(dateRange.start, dateRange.end);
      setData(result);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!exportMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportMenuOpen]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleExportMenu = () => {
    if (!data || loading || exportingFormat) return;
    setExportError(null);
    setExportMenuOpen((prev) => !prev);
  };

  const sanitizeSheetName = (name: string) => {
    const cleaned = name.replace(/[\\/?*:|\[\]]/g, '').trim();
    return cleaned.substring(0, 31) || 'Sheet';
  };

  const formatExportValue = (value: number | string) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? value : Number(value.toFixed(2));
    }
    return value;
  };

  type UnifiedRow = {
    Section: string;
    Metric: string;
    Today: string | number;
    MTD: string | number;
    YTD: string | number;
    Notes: string | number;
  };

  const buildReportArtifacts = (dashboard: DashboardData) => {
    const workbook = XLSX.utils.book_new();
    const unifiedRows: UnifiedRow[] = [];

    const sectionConfigs: Array<{ title: string; metrics: KPIMetric[] }> = [
      { title: 'Growth Funnel', metrics: dashboard.growthFunnel },
      { title: 'Business Metrics', metrics: dashboard.businessMetrics },
      { title: 'Job Portal Metrics', metrics: dashboard.jobPortalMetrics },
      { title: 'Candidate Metrics', metrics: dashboard.candidateMetrics },
      { title: 'Employer Metrics', metrics: dashboard.employerMetrics },
      { title: 'Website Performance', metrics: dashboard.websitePerformance },
    ];

    sectionConfigs.forEach((section) => {
      if (!section.metrics?.length) return;
      const rows = section.metrics.map((metric) => {
        const formatted = {
          Section: section.title,
          Metric: metric.label,
          Today: formatExportValue(metric.today),
          MTD: formatExportValue(metric.mtd),
          YTD: formatExportValue(metric.ytd),
          Notes: metric.notes || '',
        };
        unifiedRows.push(formatted);
        return {
          Metric: metric.label,
          Today: formatted.Today,
          MTD: formatted.MTD,
          YTD: formatted.YTD,
          Notes: formatted.Notes,
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(section.title));
    });

    if (dashboard.trafficSources?.length) {
      dashboard.trafficSources.forEach((source) => {
        unifiedRows.push({
          Section: 'Traffic Sources',
          Metric: source.name,
          Today: source.value,
          MTD: '',
          YTD: '',
          Notes: '',
        });
      });
      const worksheet = XLSX.utils.json_to_sheet(
        dashboard.trafficSources.map((source) => ({
          Source: source.name,
          Sessions: source.value,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Traffic Sources');
    }

    if (dashboard.topPages?.length) {
      dashboard.topPages.forEach((page) => {
        unifiedRows.push({
          Section: 'Top Pages',
          Metric: page.pageName,
          Today: page.views,
          MTD: '',
          YTD: '',
          Notes: '',
        });
      });
      const worksheet = XLSX.utils.json_to_sheet(
        dashboard.topPages.map((page) => ({
          Page: page.pageName,
          Views: page.views,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Pages');
    }

    if (dashboard.topJobPages?.length) {
      dashboard.topJobPages.forEach((page) => {
        unifiedRows.push({
          Section: 'Top Job Pages',
          Metric: page.pageName,
          Today: page.views,
          MTD: '',
          YTD: '',
          Notes: '',
        });
      });
      const worksheet = XLSX.utils.json_to_sheet(
        dashboard.topJobPages.map((page) => ({
          Page: page.pageName,
          Views: page.views,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Job Pages');
    }

    if (dashboard.pageViewsByCategory?.length) {
      dashboard.pageViewsByCategory.forEach((entry) => {
        unifiedRows.push({
          Section: 'Page Categories',
          Metric: entry.name,
          Today: entry.val,
          MTD: '',
          YTD: '',
          Notes: '',
        });
      });
      const worksheet = XLSX.utils.json_to_sheet(
        dashboard.pageViewsByCategory.map((entry) => ({
          Category: entry.name,
          Views: entry.val,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Page Categories');
    }

    if (!unifiedRows.length) {
      unifiedRows.push({
        Section: 'Info',
        Metric: 'No data available',
        Today: '',
        MTD: '',
        YTD: '',
        Notes: '',
      });
    }
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(unifiedRows), 'All Metrics');

    const overviewRows = [
      { Metric: 'Report Generated At', Value: new Date().toLocaleString() },
      { Metric: 'Start Date Filter', Value: dateRange.start || 'Not Applied' },
      { Metric: 'End Date Filter', Value: dateRange.end || 'Not Applied' },
      {
        Metric: 'Total KPI Metrics',
        Value: sectionConfigs.reduce((sum, section) => sum + (section.metrics?.length || 0), 0),
      },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(overviewRows), 'Overview');

    return { workbook, unifiedRows };
  };

  const handleExportReport = async (format: 'xlsx' | 'csv' | 'pdf') => {
    if (!data) return;
    try {
      setExportMenuOpen(false);
      setExportError(null);
      setExportingFormat(format);
      const { workbook, unifiedRows } = buildReportArtifacts(data);
      const baseFilename = `EdAssist_Report_${new Date().toISOString().slice(0, 10)}`;

      if (format === 'xlsx') {
        await XLSX.writeFileXLSX(workbook, `${baseFilename}.xlsx`, { compression: true });
      } else if (format === 'csv') {
        const sheet = workbook.Sheets['All Metrics'] || workbook.Sheets[workbook.SheetNames[0]];
        const csvContent = sheet ? XLSX.utils.sheet_to_csv(sheet) : '';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${baseFilename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        doc.setFontSize(16);
        doc.text('EdAssist Analytics Report', 40, 40);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);
        doc.text(`Filters: ${dateRange.start || 'Beginning'} → ${dateRange.end || 'Today'}`, 40, 72);

        autoTable(doc, {
          startY: 90,
          head: [['Section', 'Metric', 'Today', 'MTD', 'YTD', 'Notes']],
          body: unifiedRows.map((row) => [
            row.Section,
            row.Metric,
            row.Today ?? '',
            row.MTD ?? '',
            row.YTD ?? '',
            row.Notes ?? '',
          ]),
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        });

        doc.save(`${baseFilename}.pdf`);
      }
      setExportMenuOpen(false);
    } catch (error) {
      console.error('Failed to export report', error);
      setExportError('Failed to generate the report. Please try again.');
    } finally {
      setExportingFormat(null);
    }
  };

  const isCustomDate = dateRange.start || dateRange.end;
  const colLabels = isCustomDate ? { today: 'Selected', mtd: 'MTD', ytd: 'YTD' } : undefined;

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Gathering Intelligence...</p>
      </div>
    );
  }

  if (!data && !loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Data</h2>
        <p className="text-slate-500 mb-6">Please ensure the backend server is running.</p>
        <button onClick={loadData} className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-auto py-4 md:h-20 md:py-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-gradient-to-tr from-brand-600 to-brand-400 text-white p-2 rounded-xl shadow-lg shadow-brand-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">EdAssist <span className="text-brand-600">Analytics</span></h1>
              <p className="text-xs text-slate-400 font-medium">KPI Monitoring System</p>
            </div>
            <button
              onClick={() => navigate('/charts')}
              className="ml-4 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              View Charts
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="bg-white text-xs text-slate-600 px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="bg-white text-xs text-slate-600 px-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
              />
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className={`group relative px-5 py-2 bg-brand-600 border border-transparent text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-all hover:shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]`}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="flex items-center gap-2">
                  Apply
                </span>
              )}
            </button>

            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={toggleExportMenu}
                disabled={!data || loading || !!exportingFormat}
                className="px-4 py-2 border border-indigo-100 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {exportingFormat ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v12m0 0l3-3m-3 3l-3-3m-3 7h12a2 2 0 002-2v-4" />
                  </svg>
                )}
                <span>Export Report</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-10">
                  {[
                    { label: 'Export as PDF', format: 'pdf', description: 'Printable summary' },
                    { label: 'Export as XLSX', format: 'xlsx', description: 'Full workbook' },
                    { label: 'Export as CSV', format: 'csv', description: 'All metrics table' },
                  ].map((option) => (
                    <button
                      key={option.format}
                      onClick={() => handleExportReport(option.format as 'pdf' | 'xlsx' | 'csv')}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 flex flex-col"
                    >
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-xs text-slate-400">{option.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {exportError && (
            <p className="text-xs text-red-500 mt-2 text-right">{exportError}</p>
          )}

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="text-[11px] text-slate-400 mt-1">Last sync {lastRefreshed.toLocaleTimeString()}</p>
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
        {isCustomDate && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800 flex items-center justify-between animate-fadeIn">
            <span>Viewing data for range: <strong>{dateRange.start || 'Beginning'}</strong> to <strong>{dateRange.end || 'Today'}</strong></span>
            <button
              onClick={() => { setDateRange({ start: '', end: '' }); setTimeout(() => loadData(), 0); }}
              className="text-xs underline text-amber-600 hover:text-amber-800"
            >
              Clear Filter
            </button>
          </div>
        )}

        {data && (
          <>
            <section className="animate-slideUp" style={{ animationDelay: '0ms' }}>
              <SectionHeader title="Growth Funnel" colorClass="bg-brand-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {data.growthFunnel.map((metric, idx) => (
                  <MetricCard key={idx} data={metric} colorTheme="blue" labels={colLabels} />
                ))}
              </div>
            </section>

            <section className="animate-slideUp" style={{ animationDelay: '100ms' }}>
              <SectionHeader title="Business & Revenue Metrics" colorClass="bg-emerald-500" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {data.businessMetrics.map((metric, idx) => (
                  <MetricCard key={idx} data={metric} colorTheme="emerald" labels={colLabels} />
                ))}
              </div>
            </section>

            <section className="animate-slideUp" style={{ animationDelay: '200ms' }}>
              <SectionHeader title="Job Portal Metrics" colorClass="bg-violet-500" />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 content-start">
                  {data.jobPortalMetrics.map((metric, idx) => (
                    <MetricCard key={idx} data={metric} colorTheme="violet" labels={colLabels} />
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                    <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                      Top 5 Job Pages
                    </h3>
                    <div className="space-y-4">
                      {data.topJobPages && data.topJobPages.length > 0 ? (
                        data.topJobPages.map((page, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-violet-50 hover:bg-white hover:shadow-sm border border-transparent hover:border-violet-100 transition-all cursor-default">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold bg-violet-200 text-violet-700`}>
                                {i + 1}
                              </span>
                              <span className="text-sm font-medium text-slate-700 truncate" title={page.pageName}>{page.pageName}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800">{page.views.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">views</span></span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 text-sm italic">No specific job page data found.</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                      Page Views by Category
                      {!isCustomDate && <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-[10px] rounded-full uppercase">GA4 Data</span>}
                    </h3>
                    <div className="h-48 w-full">
                      {data.pageViewsByCategory && data.pageViewsByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.pageViewsByCategory}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#94a3b8' }} />
                            <Tooltip
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                              formatter={(value: number) => value.toLocaleString()}
                            />
                            <Bar dataKey="val" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500} isAnimationActive={true} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">No category data available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="animate-slideUp" style={{ animationDelay: '300ms' }}>
                <SectionHeader title="Candidate Metrics" colorClass="bg-orange-500" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {data.candidateMetrics.map((metric, idx) => (
                    <MetricCard key={idx} data={metric} colorTheme="orange" labels={colLabels} />
                  ))}
                </div>
              </section>

              <section className="animate-slideUp" style={{ animationDelay: '400ms' }}>
                <SectionHeader title="Employer Metrics" colorClass="bg-rose-500" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {data.employerMetrics.map((metric, idx) => (
                    <MetricCard key={idx} data={metric} colorTheme="rose" labels={colLabels} />
                  ))}
                </div>
              </section>
            </div>

            <section className="animate-slideUp" style={{ animationDelay: '500ms' }}>
              <SectionHeader title="Website Performance (GA4)" colorClass="bg-indigo-500" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {data.websitePerformance.map((metric, idx) => (
                  <MetricCard key={idx} data={metric} colorTheme="indigo" labels={colLabels} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                    Traffic Sources
                    {isCustomDate && <span className="text-[10px] text-slate-400 font-normal ml-auto">Selected Range</span>}
                    {!isCustomDate && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded-full uppercase">Real Data</span>}
                  </h3>
                  <div className="h-64 w-full">
                    {data.trafficSources && data.trafficSources.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.trafficSources}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            animationDuration={1500}
                            animationBegin={200}
                            isAnimationActive={true}
                          >
                            {data.trafficSources.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">No traffic data available</div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                    Top 5 Website Pages
                    {isCustomDate && <span className="text-[10px] text-slate-400 font-normal ml-auto">Selected Range</span>}
                    {!isCustomDate && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded-full uppercase">Real Data</span>}
                  </h3>
                  <div className="space-y-4">
                    {data.topPages && data.topPages.length > 0 ? (
                      data.topPages.map((page, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all cursor-default">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium text-slate-700 truncate" title={page.pageName}>{page.pageName}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-800">{page.views.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">views</span></span>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">No page data available</div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

