/**
 * BACKEND SERVER CODE - Node.js + Express + GA4
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const passport = require('./config/passport');
const connectDB = require('./config/db');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// --- CONFIGURATION ---
const propertyId = process.env.GA4_PROPERTY_ID || '491848636'; 

// Initialize GA4 Client using Environment Variables for Security
// This client handles the OAuth2 flow automatically using the Service Account keys.
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

/**
 * Helper: Get Date Ranges
 * Returns 'startDate' and 'endDate' strings for GA4 based on a reference date
 * Note: GA4 data for "today" is often delayed, so we use "yesterday" as the default for "today"
 */
const getDateRanges = (customEndDate) => {
  // Format Date to YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  // If customEndDate is provided, use it as the anchor. Otherwise use yesterday (more reliable than today)
  let referenceDate;
  let endStr;
  
  if (customEndDate) {
    referenceDate = new Date(customEndDate);
    endStr = formatDate(referenceDate);
  } else {
    // Use yesterday as default since GA4 data for today is often delayed/not available
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    referenceDate = yesterday;
    endStr = formatDate(yesterday);
  }
  
  // MTD (Month to Date) - 1st of the reference month
  const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const mtdStart = formatDate(startOfMonth);

  // YTD (Year to Date) - Jan 1st of the reference year
  const startOfYear = new Date(referenceDate.getFullYear(), 0, 1);
  const ytdStart = formatDate(startOfYear);

  return { endStr, mtdStart, ytdStart, todayStr: endStr };
};

/**
 * Helper: Fetch Basic Metrics for a specific range
 */
async function getGA4Metrics(startDate, endDate) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
      ],
    });

    if (response.rows && response.rows.length > 0) {
      const row = response.rows[0];
      const activeUsers = parseInt(row.metricValues[0].value) || 0;
      const pageViews = parseInt(row.metricValues[1].value) || 0;
      const sessions = parseInt(row.metricValues[2].value) || 0;
      const avgDuration = parseFloat(row.metricValues[3].value) || 0;
      
      return {
        activeUsers,
        pageViews,
        sessions,
        avgDuration,
      };
    }
    console.warn(`No data returned for GA4 metrics (${startDate} to ${endDate})`);
    return { activeUsers: 0, pageViews: 0, sessions: 0, avgDuration: 0 };
  } catch (error) {
    console.error(`Error fetching GA4 data (${startDate} to ${endDate}):`, error.message);
    if (error.details) {
      console.error('Error details:', JSON.stringify(error.details, null, 2));
    }
    return null;
  }
}

/**
 * Helper: Fetch Traffic Sources
 */
async function getTrafficSources(startDate, endDate) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }], // or sessionSource
      metrics: [{ name: 'sessions' }],
      limit: 5,
    });
    
    return response.rows.map(row => ({
      name: row.dimensionValues[0].value,
      value: parseInt(row.metricValues[0].value),
    }));
  } catch (error) {
    console.error('Error fetching sources:', error.message);
    return [];
  }
}

/**
 * Helper: Fetch Top Pages
 */
async function getTopPages(startDate, endDate) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }], 
      metrics: [{ name: 'screenPageViews' }],
      limit: 5,
      orderBys: [{ desc: true, metric: { metricName: 'screenPageViews' } }]
    });
    
    return response.rows.map(row => ({
      pageName: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value),
    }));
  } catch (error) {
    console.error('Error fetching pages:', error.message);
    return [];
  }
}

/**
 * Helper: Fetch Top Job Pages (Pages containing 'job' or 'career')
 */
async function getTopJobPages(startDate, endDate) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: 'job', // Basic filter for job pages
            caseSensitive: false
          }
        }
      },
      limit: 5,
      orderBys: [{ desc: true, metric: { metricName: 'screenPageViews' } }]
    });

    if (!response.rows || response.rows.length === 0) return [];
    
    return response.rows.map(row => ({
      pageName: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value),
    }));
  } catch (error) {
    console.error('Error fetching job pages:', error.message);
    return []; // Return empty if no job pages found or error
  }
}

/**
 * Helper: Fetch Page Views by Category/Department
 * Groups pages by common patterns (dev, marketing, sales, hr, etc.)
 */
async function getPageViewsByCategory(startDate, endDate) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      limit: 100, // Get more pages to categorize
    });

    if (!response.rows || response.rows.length === 0) return [];

    // Categorize pages based on URL patterns
    const categories = {
      'Dev': 0,
      'Mkt': 0,
      'Sales': 0,
      'HR': 0,
      'Other': 0
    };

    response.rows.forEach(row => {
      const pagePath = row.dimensionValues[0].value.toLowerCase();
      const views = parseInt(row.metricValues[0].value);

      if (pagePath.includes('dev') || pagePath.includes('developer') || pagePath.includes('tech') || pagePath.includes('engineering')) {
        categories['Dev'] += views;
      } else if (pagePath.includes('marketing') || pagePath.includes('mkt') || pagePath.includes('marketing')) {
        categories['Mkt'] += views;
      } else if (pagePath.includes('sales') || pagePath.includes('business')) {
        categories['Sales'] += views;
      } else if (pagePath.includes('hr') || pagePath.includes('human') || pagePath.includes('recruit')) {
        categories['HR'] += views;
      } else {
        categories['Other'] += views;
      }
    });

    // Convert to array format and filter out zeros
    return Object.entries(categories)
      .filter(([_, val]) => val > 0)
      .map(([name, val]) => ({ name, val }));
  } catch (error) {
    console.error('Error fetching page views by category:', error.message);
    return [];
  }
}

/**
 * Helper: Fetch Additional GA4 Metrics (Bounce Rate, Conversions, etc.)
 */
async function getAdditionalMetrics(startDate, endDate) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'bounceRate' },
        { name: 'conversions' },
        { name: 'eventCount' },
        { name: 'newUsers' },
      ],
    });

    if (response.rows && response.rows.length > 0) {
      const row = response.rows[0];
      return {
        bounceRate: parseFloat(row.metricValues[0].value),
        conversions: parseFloat(row.metricValues[1].value),
        eventCount: parseInt(row.metricValues[2].value),
        newUsers: parseInt(row.metricValues[3].value),
      };
    }
    return { bounceRate: 0, conversions: 0, eventCount: 0, newUsers: 0 };
  } catch (error) {
    console.error(`Error fetching additional metrics (${startDate} to ${endDate}):`, error.message);
    return null;
  }
}

// --- AUTH ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));

// --- MAIN API ENDPOINT ---
app.get('/api/dashboard-data', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Determine context dates based on user selection or defaults
    const { endStr, mtdStart, ytdStart, todayStr } = getDateRanges(endDate);
    
    // If user provided a specific start date, use it. Otherwise use yesterday (more reliable than today for GA4)
    // GA4 data for "today" is often delayed, so we use yesterday as the default
    const selectedStart = startDate || todayStr;
    const selectedEnd = endStr;
    
    // Log the dates being used for debugging
    console.log(`Fetching GA4 data - Today: ${todayStr}, MTD: ${mtdStart} to ${endStr}, YTD: ${ytdStart} to ${endStr}`);

    // 1. Fetch Real GA4 Data in Parallel
    // Traffic Sources and Top Pages will reflect the "Selected Range" (startDate to endDate)
    const [
      todayData, 
      mtdData, 
      ytdData, 
      trafficSources, 
      topPages, 
      topJobPages,
      pageViewsByCategory,
      todayAdditional,
      mtdAdditional,
      ytdAdditional
    ] = await Promise.all([
      getGA4Metrics(selectedStart, selectedEnd),
      getGA4Metrics(mtdStart, endStr),
      getGA4Metrics(ytdStart, endStr),
      getTrafficSources(!startDate ? mtdStart : selectedStart, selectedEnd),
      getTopPages(!startDate ? mtdStart : selectedStart, selectedEnd),
      getTopJobPages(!startDate ? mtdStart : selectedStart, selectedEnd),
      getPageViewsByCategory(!startDate ? mtdStart : selectedStart, selectedEnd),
      getAdditionalMetrics(selectedStart, selectedEnd),
      getAdditionalMetrics(mtdStart, endStr),
      getAdditionalMetrics(ytdStart, endStr)
    ]);

    // 2. Aggregate Data
    // Note: Business metrics (Leads, Revenue) usually require a Database/CRM connection.
    // Since we only have GA4 access right now, we will use mock values for non-GA4 metrics
    // to keep the dashboard structure intact.
    
    const dashboardData = {
      growthFunnel: [
        { 
          label: 'Website Visits', 
          today: todayData?.activeUsers || 0, 
          mtd: mtdData?.activeUsers || 0, 
          ytd: ytdData?.activeUsers || 0 
        },
        { 
          label: 'Job Views', 
          today: todayData?.pageViews || 0, 
          mtd: mtdData?.pageViews || 0, 
          ytd: ytdData?.pageViews || 0 
        },
        // Placeholders for CRM data
        { label: 'Applications', today: 0, mtd: 12, ytd: 150 },
        { label: 'Shortlisted', today: 0, mtd: 4, ytd: 45 },
        { label: 'Interviews', today: 0, mtd: 2, ytd: 30 },
        { label: 'Offers', today: 0, mtd: 1, ytd: 12 },
        { label: 'Hires / Joins', today: 0, mtd: 1, ytd: 10 },
      ],
      businessMetrics: [
        { label: 'Total Leads', today: 2, mtd: 45, ytd: 320 },
        { label: 'Employer Leads', today: 0, mtd: 5, ytd: 40 },
        { label: 'Training Leads', today: 2, mtd: 40, ytd: 280 },
        { label: 'Monthly Revenue', today: '---', mtd: 5000, ytd: 45000, isCurrency: true },
        { label: 'CPA', today: '---', mtd: 25, ytd: 28, isCurrency: true },
        { label: 'Avg Revenue per Employer', today: '---', mtd: 1200, ytd: 1500, isCurrency: true },
        { label: 'Marketing ROI', today: '---', mtd: '3.2x', ytd: '4.0x' },
      ],
      jobPortalMetrics: [
        { label: 'Total Live Jobs', today: 50, mtd: 50, ytd: 50 },
        { label: 'Jobs Added', today: 1, mtd: 10, ytd: 85 },
        { label: 'Applications Received', today: 5, mtd: 120, ytd: 1500 },
        { label: 'Applications per Job', today: 0.1, mtd: 2.4, ytd: 30 },
        { label: 'Conversion Rate', today: '1%', mtd: '2.5%', ytd: '3.1%' },
      ],
      candidateMetrics: [
        { label: 'Total Candidates', today: '---', mtd: '---', ytd: 5400 },
        { label: 'New Registrations', today: 8, mtd: 240, ytd: 2100 },
      ],
      employerMetrics: [
        { label: 'Licensed Employers', today: 0, mtd: 2, ytd: 15 },
        { label: 'Jobs per Employer', today: '---', mtd: 3, ytd: 4.5 },
      ],
      websitePerformance: [
        { label: 'Total Clicks (GSC)', today: '---', mtd: '---', ytd: '---', notes: 'Requires GSC API' },
        { label: 'Impressions (GSC)', today: '---', mtd: '---', ytd: '---', notes: 'Requires GSC API' },
        { label: 'CTR %', today: '---', mtd: '---', ytd: '---', notes: 'Requires GSC API' },
        { label: 'Total Users', today: todayData?.activeUsers || 0, mtd: mtdData?.activeUsers || 0, ytd: ytdData?.activeUsers || 0 },
        { label: 'Sessions', today: todayData?.sessions || 0, mtd: mtdData?.sessions || 0, ytd: ytdData?.sessions || 0 },
        { label: 'New Users', today: todayAdditional?.newUsers || 0, mtd: mtdAdditional?.newUsers || 0, ytd: ytdAdditional?.newUsers || 0 },
        { label: 'Bounce Rate', today: todayAdditional?.bounceRate ? `${(todayAdditional.bounceRate * 100).toFixed(1)}%` : '0%', mtd: mtdAdditional?.bounceRate ? `${(mtdAdditional.bounceRate * 100).toFixed(1)}%` : '0%', ytd: ytdAdditional?.bounceRate ? `${(ytdAdditional.bounceRate * 100).toFixed(1)}%` : '0%' },
        { label: 'Avg Session Duration', today: todayData?.avgDuration ? `${Math.round(todayData.avgDuration)}s` : '0s', mtd: mtdData?.avgDuration ? `${Math.round(mtdData.avgDuration)}s` : '0s', ytd: ytdData?.avgDuration ? `${Math.round(ytdData.avgDuration)}s` : '0s' },
        { label: 'Total Events', today: todayAdditional?.eventCount || 0, mtd: mtdAdditional?.eventCount || 0, ytd: ytdAdditional?.eventCount || 0 },
        { label: 'Conversions', today: todayAdditional?.conversions || 0, mtd: mtdAdditional?.conversions || 0, ytd: ytdAdditional?.conversions || 0 },
      ],
      trafficSources: trafficSources,
      topPages: topPages,
      topJobPages: topJobPages,
      pageViewsByCategory: pageViewsByCategory || [],
    };

    res.json(dashboardData);

  } catch (error) {
    console.error("Endpoint Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});