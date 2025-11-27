<!-- <div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div> -->

# Run the EdAssist Analytics Dashboard

This project contains a React/Vite frontend (`/`) and a lightweight Node.js + Express backend (`/backend`) that fetches live metrics from the Google Analytics 4 (GA4) Data API via a service account.

## Prerequisites

- Node.js 18+
- A GA4 property that you can access via a Google Cloud service account

## 1. Configure GA4 Credentials

1. In Google Cloud Console create (or reuse) a service account and download the JSON key.
2. Copy `backend/env.sample` to `backend/.env` and fill in the values from the JSON:
   - `GA4_PROPERTY_ID` → the numeric GA4 property id (for example `491848636`).
   - `GOOGLE_PROJECT_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` → use the fields from the JSON.  
     When pasting the private key keep it on a single line and replace every newline with the literal sequence `\n`. Example:  
     `GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n`
3. In GA4, add the service-account email (something like `service-account@project.iam.gserviceaccount.com`) as a user with at least **Viewer** permissions for the property.

> **Windows tip:** when editing `.env` files, wrap the private key value in double quotes if PowerShell interprets special characters.

## 2. Start the Backend (GA4 API)

```
cd backend
npm install
npm run dev
```

The server listens on `http://localhost:5000` by default and exposes `GET /api/dashboard-data`, which aggregates:

- **Core Metrics**: Active users, sessions, page views, average session duration
- **User Behavior**: New users, bounce rate, conversions, total events
- **Traffic Analysis**: Traffic sources by channel group
- **Page Analytics**: Top pages, top job pages, page views by category/department
- **Performance Metrics**: All metrics available in Today, MTD (Month-to-Date), and YTD (Year-to-Date) views

All GA4 data is fetched in real-time from your property. The dashboard dynamically displays:
- Page views categorized by department (Dev, Marketing, Sales, HR) based on URL patterns
- Real-time traffic source breakdowns
- Live website performance metrics

Non-GA4 metrics (like applications, revenue, leads) remain mock placeholders until a CRM or ATS is connected.

## 3. Start the Frontend

In a second terminal (project root):

```
npm install
npm run dev
```

By default the React app expects the backend at `http://localhost:5000`. To point it elsewhere set `VITE_API_URL` before running Vite, e.g.

```
VITE_API_URL=https://your-api.com/api/dashboard-data npm run dev
```

If the backend is offline the frontend automatically falls back to mock data so you can still demo the UI.
