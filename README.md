📊 EdAssist Analytics Dashboard — Setup & Run Guide

This project includes:

React + Vite Frontend (/)

Node.js + Express Backend (/backend)

Live Google Analytics 4 (GA4) Data fetched through a secure Google Cloud Service Account

The dashboard provides real-time metrics, traffic insights, page analytics, and performance trends for EdAssist.

✅ Prerequisites

Before running the project, ensure you have:

Node.js 18+

Access to a GA4 Property

A Google Cloud Service Account with a downloaded JSON key

1️⃣ Configure Google Analytics 4 (GA4) Credentials
Step 1: Create / Use a Service Account

Go to Google Cloud Console

Create or reuse an existing Service Account

Download its JSON key

Step 2: Configure .env

Inside /backend:

cp env.sample .env


Fill the following fields using your service account JSON:

.env Variable	Description
GA4_PROPERTY_ID	Numeric GA4 Property ID (e.g., 491848636)
GOOGLE_PROJECT_ID	Project ID from the JSON
GOOGLE_CLIENT_EMAIL	Service Account email
GOOGLE_PRIVATE_KEY	Private key with \n escape sequences

⚠️ Important:
The private key must be one line, like:

GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nABC123...\n-----END PRIVATE KEY-----\n

Step 3: Add Service Account to GA4

In GA4:

Go to Admin → Property Access Management

Add the Service Account Email

Assign Viewer or higher permissions

Windows Tip:
If PowerShell breaks the private key, wrap it in double quotes.

2️⃣ Start the Backend (GA4 API Server)

In /backend:

cd backend
npm install
npm run dev

🚀 Backend runs at:

http://localhost:5000

📡 Available Endpoint
GET /api/dashboard-data


This API fetches and aggregates live GA4 metrics:

✔ Core Metrics

Active Users

Sessions

Pageviews

Avg. Session Duration

✔ User Behavior

New Users

Bounce Rate

Conversions

Total Events

✔ Traffic Analysis

Channel Group Breakdown

Acquisition Insights

✔ Page Analytics

Top pages

Top job detail pages

Department-wise page views (Dev, HR, Marketing, Sales)

✔ Time-Based Performance

Today

MTD (Month-to-Date)

YTD (Year-to-Date)

Mock data is used for CRM/ATS metrics (revenue, job applications, etc.) until integration.

3️⃣ Start the Frontend

From project root:

npm install
npm run dev

Frontend default API target:

http://localhost:5000

To use a custom backend API:

VITE_API_URL=https://your-api.com/api/dashboard-data npm run dev


If the backend is offline, the dashboard auto-falls back to mock data, so you can still demo the UI smoothly.

🎉 You're Ready!

Your EdAssist Analytics Dashboard is now fully configured with:

Live GA4 metrics

Clean UI powered by React

Real-time insights API
