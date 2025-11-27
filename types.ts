export interface KPIMetric {
  label: string;
  today: number | string;
  mtd: number | string;
  ytd: number | string;
  isCurrency?: boolean;
  notes?: string;
}

// Fix: Add index signature to satisfy Recharts data type requirements (ChartDataInput)
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface DashboardData {
  growthFunnel: KPIMetric[];
  businessMetrics: KPIMetric[];
  jobPortalMetrics: KPIMetric[];
  candidateMetrics: KPIMetric[];
  employerMetrics: KPIMetric[];
  websitePerformance: KPIMetric[];
  trafficSources: ChartDataPoint[];
  topPages: { pageName: string; views: number }[];
  topJobPages: { pageName: string; views: number }[];
  pageViewsByCategory?: { name: string; val: number }[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider?: string;
  avatar?: string;
}