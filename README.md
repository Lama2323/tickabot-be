# Tickabot Backend

This is the backend for the Tickabot application, built with Node.js, Express, and Supabase.

## Prerequisites
- Node.js (v18 or higher recommended)
- npm

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env` file in this directory with the following keys:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

## Running the Server

Start the development server:
```bash
npm run dev
```
The server will start on `http://localhost:8000`.

To build usage:
```bash
npm run build
npm start
```