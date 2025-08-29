# Secure Crediential Web Application Setup Guide

## Prerequisites

Before you begin, ensure you have:
- Node.js 14+ installed
- A Supabase account
- Git installed (optional)

## Step 1: Supabase Setup

1. Create a new Supabase project:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Enter project details
   - Wait for the database to be ready

2. Get your API credentials:
   - In your project dashboard, go to Settings > API
   - Copy the `Project URL` and `anon/public` key
   - You'll need these for the environment variables

3. Set up the database schema:
   - Go to the SQL Editor in your Supabase dashboard
   - Run the following migrations in order:
     - `20250128031258_navy_grass.sql`
     - `20250224022256_throbbing_bread.sql`
     - `20250224054210_curly_villa.sql`

## Step 2: Project Setup

1. Clone the repository (or download the source code):
   ```bash
   git clone https://github.com/your-username/Secure-Credential-Web-Application1.git
   cd Secure-Credential-Web-Application1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```env
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Step 3: Docker Setup (Optional)

If you want to use Docker:

1. Ensure Docker and Docker Compose are installed

2. Build and run the containers:
   ```bash
   docker-compose up --build
   ```

## Verification

To verify your setup:

1. Open `http://localhost:5173` in your browser
2. You should see the login page
3. Create a new account
4. Set up your master key
5. Try adding a new credential

## Common Issues

### Database Connection Issues
- Verify your Supabase credentials
- Check if the project URL is correct
- Ensure your IP is allowed in Supabase

### Build Issues
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: 
  ```bash
  rm -rf node_modules
  npm install
  ```

### Docker Issues
- Ensure ports are not in use
- Check Docker logs for errors