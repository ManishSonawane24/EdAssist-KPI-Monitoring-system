import { DashboardData } from '../types';

// Allow overriding the backend URL via env for deployments
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/dashboard-data';

// Helper to generate random numbers for the demo
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);


export const fetchDashboardData = async (startDate?: string, endDate?: string): Promise<DashboardData> => {
  try {
    let url = API_URL;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Backend not reachable');
    }
    return await response.json();
  } catch (error) {
    console.warn("Backend not connected. Using MOCK data.");
    
    // Mock Data Fallback
    return {
      growthFunnel: [
        { label: 'Website Visits', today: rand(100, 500), mtd: rand(2000, 5000), ytd: rand(15000, 30000) },
        { label: 'Job Views', today: rand(50, 200), mtd: rand(1000, 3000), ytd: rand(8000, 20000) },
        { label: 'Applications', today: rand(10, 50), mtd: rand(200, 800), ytd: rand(1000, 5000) },
        { label: 'Shortlisted', today: rand(2, 10), mtd: rand(50, 150), ytd: rand(300, 1000) },
        { label: 'Interviews', today: rand(1, 5), mtd: rand(20, 80), ytd: rand(150, 600) },
        { label: 'Offers', today: rand(0, 2), mtd: rand(5, 30), ytd: rand(50, 200) },
        { label: 'Hires / Joins', today: 0, mtd: rand(3, 20), ytd: rand(40, 150) },
      ],
      businessMetrics: [
        { label: 'Total Leads', today: rand(5, 15), mtd: rand(100, 300), ytd: '---' },
        { label: 'Employer Leads', today: rand(1, 3), mtd: rand(20, 50), ytd: '---' },
        { label: 'Training Leads', today: rand(2, 8), mtd: rand(50, 150), ytd: '---' },
        { label: 'Monthly Revenue', today: '---', mtd: rand(5000, 15000), ytd: rand(50000, 120000), isCurrency: true },
        { label: 'CPA', today: '---', mtd: rand(10, 50), ytd: rand(12, 45), isCurrency: true },
        { label: 'Avg Revenue per Employer', today: '---', mtd: rand(1000, 2000), ytd: rand(2000, 5000), isCurrency: true },
        { label: 'Marketing ROI', today: '---', mtd: '3.5x', ytd: '4.2x' },
      ],
      jobPortalMetrics: [
        { label: 'Total Live Jobs', today: rand(40, 50), mtd: rand(40, 50), ytd: rand(40, 50) },
        { label: 'Jobs Added', today: rand(1, 3), mtd: rand(10, 25), ytd: rand(100, 300) },
        { label: 'Applications Received', today: rand(15, 60), mtd: rand(400, 900), ytd: rand(3000, 8000) },
        { label: 'Applications per Job', today: rand(2, 5), mtd: rand(10, 20), ytd: rand(50, 100) },
        { label: 'Conversion Rate', today: '2%', mtd: '3.5%', ytd: '4.1%' },
      ],
      candidateMetrics: [
        { label: 'Total Candidates', today: '---', mtd: '---', ytd: rand(5000, 10000) },
        { label: 'New Registrations', today: rand(5, 20), mtd: rand(150, 400), ytd: rand(2000, 5000) },
      ],
      employerMetrics: [
        { label: 'Licensed Employers', today: 0, mtd: 2, ytd: 15 },
        { label: 'Jobs per Employer', today: '---', mtd: 3, ytd: 4.5 },
      ],
      websitePerformance: [
        { label: 'Total Clicks (GSC)', today: '---', mtd: rand(2000, 5000), ytd: rand(20000, 50000) },
        { label: 'Impressions (GSC)', today: '---', mtd: rand(50000, 100000), ytd: rand(500000, 1000000) },
        { label: 'CTR %', today: '---', mtd: '2.1%', ytd: '1.9%' },
        { label: 'Total Users', today: rand(100, 300), mtd: rand(3000, 6000), ytd: rand(30000, 60000) },
        { label: 'Sessions', today: rand(120, 400), mtd: rand(3500, 7000), ytd: rand(35000, 75000) },
      ],
      trafficSources: [
        { name: 'Organic Search', value: 45 },
        { name: 'Direct', value: 30 },
        { name: 'Social', value: 15 },
        { name: 'Referral', value: 10 },
      ],
      topPages: [
        { pageName: '/home', views: 1200 },
        { pageName: '/jobs', views: 800 },
        { pageName: '/about', views: 400 },
        { pageName: '/contact', views: 300 },
        { pageName: '/blog', views: 200 },
      ],
      topJobPages: [
        { pageName: '/jobs/developer', views: 300 },
        { pageName: '/jobs/designer', views: 250 },
        { pageName: '/jobs/manager', views: 150 },
        { pageName: '/jobs/sales', views: 100 },
        { pageName: '/jobs/intern', views: 80 },
      ]
    };
  }
};