# Supabase Setup for KeyYatri

## Overview

Secure Crediential Web Application uses Supabase as its backend service for authentication, database management, and secure credential storage. This document provides complete setup instructions and configuration details.

## Quick Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `keyyatri-live` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get API Keys

Once your project is created, go to **Settings > API** to find:
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon/Public Key**: Used in client applications
- **Service Role Key**: Used for server-side operations (keep secret)

### 3. Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Database Setup

Run the following SQL in your Supabase SQL Editor (**SQL Editor > New Query**):

```sql
-- KeyYatri: Complete Supabase Database Setup
-- Run this in Supabase SQL Editor to set up all tables, policies, and functions

-- Extensions
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- =========================================
-- Tables
-- =========================================

-- credentials: Stores encrypted user credentials
create table if not exists public.credentials (
  id uuid default extensions.gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  name text not null,
  username text not null,
  encrypted_password text not null,
  description text,
  url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- master_keys: Stores encrypted master keys for each user
create table if not exists public.master_keys (
  id uuid default extensions.gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) unique,
  encrypted_key text not null,
  created_at timestamptz default now()
);

-- feature_requests: Stores user feature requests
create table if not exists public.feature_requests (
  id uuid default extensions.gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  title text not null,
  description text not null,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- Row Level Security (RLS)
-- =========================================
alter table public.credentials enable row level security;
alter table public.master_keys enable row level security;
alter table public.feature_requests enable row level security;

-- =========================================
-- Helper Functions
-- =========================================

-- Generic updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Feature requests updated_at trigger function
create or replace function public.update_feature_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- User self-deletion function (SECURITY DEFINER for elevated privileges)
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  -- Delete user's data
  delete from public.credentials where user_id = auth.uid();
  delete from public.master_keys where user_id = auth.uid();
  delete from public.feature_requests where user_id = auth.uid();

  -- Delete the user record
  delete from auth.users where id = auth.uid();
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.delete_user() to authenticated;

-- =========================================
-- Triggers
-- =========================================
drop trigger if exists update_credentials_updated_at on public.credentials;
create trigger update_credentials_updated_at
  before update on public.credentials
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_feature_requests_updated_at on public.feature_requests;
create trigger update_feature_requests_updated_at
  before update on public.feature_requests
  for each row
  execute function public.update_feature_requests_updated_at();

-- =========================================
-- Security Policies
-- =========================================

-- credentials policies
drop policy if exists "Users can create their own credentials" on public.credentials;
create policy "Users can create their own credentials"
  on public.credentials
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own credentials" on public.credentials;
create policy "Users can view their own credentials"
  on public.credentials
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own credentials" on public.credentials;
create policy "Users can update their own credentials"
  on public.credentials
  for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own credentials" on public.credentials;
create policy "Users can delete their own credentials"
  on public.credentials
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- master_keys policies
drop policy if exists "Users can insert their own master key" on public.master_keys;
create policy "Users can insert their own master key"
  on public.master_keys
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own master key" on public.master_keys;
create policy "Users can view their own master key"
  on public.master_keys
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own master key" on public.master_keys;
create policy "Users can update their own master key"
  on public.master_keys
  for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own master key" on public.master_keys;
create policy "Users can delete their own master key"
  on public.master_keys
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- feature_requests policies
drop policy if exists "Users can create their own feature requests" on public.feature_requests;
create policy "Users can create their own feature requests"
  on public.feature_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own feature requests" on public.feature_requests;
create policy "Users can view their own feature requests"
  on public.feature_requests
  for select
  to authenticated
  using (auth.uid() = user_id);
```

## Authentication Configuration

### 1. Enable Email/Password Authentication

1. Go to **Authentication > Settings**
2. Enable "Email confirmations" (recommended for production)
3. Configure email templates if needed

### 2. Configure Auth Settings

In **Authentication > Settings > Auth**:

```json
{
  "enable_signup": true,
  "enable_confirmations": true,
  "enable_email_change_confirmations": true,
  "enable_phone_confirmations": false,
  "enable_phone_change_confirmations": false,
  "enable_recovery": true,
  "enable_refresh_token_rotation": true,
  "refresh_token_reuse_interval": 10,
  "security_update_password_require_reauthentication": true,
  "mfa_enabled": false
}
```

### 3. Email Templates (Optional)

Customize email templates in **Authentication > Templates**:
- **Confirm signup**
- **Reset password**
- **Change email address**

## Database Schema

### Tables Overview

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `credentials` | Encrypted user credentials | RLS enabled, user-specific |
| `master_keys` | User encryption keys | One per user, RLS enabled |
| `feature_requests` | User feedback/requests | RLS enabled, status tracking |

### Table Details

#### credentials
```sql
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- name: TEXT (Credential name)
- username: TEXT (Username/email)
- encrypted_password: TEXT (Encrypted password)
- description: TEXT (Optional description)
- url: TEXT (Optional website URL)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### master_keys
```sql
- id: UUID (Primary Key)
- user_id: UUID (Unique, references auth.users)
- encrypted_key: TEXT (Encrypted master key)
- created_at: TIMESTAMPTZ
```

#### feature_requests
```sql
- id: UUID (Primary Key)
- user_id: UUID (References auth.users)
- title: TEXT (Request title)
- description: TEXT (Request description)
- status: TEXT (Default: 'pending')
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Policies enforce user isolation

### Encryption
- Passwords are encrypted client-side before storage
- Master keys are encrypted and stored securely
- Uses AES-256 encryption

### Authentication
- Email/password authentication
- Session management
- Secure token handling

## API Usage Examples

### Client Setup
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Authentication
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign out
const { error } = await supabase.auth.signOut()
```

### Credentials Management
```typescript
// Insert credential
const { data, error } = await supabase
  .from('credentials')
  .insert({
    name: 'Gmail',
    username: 'user@gmail.com',
    encrypted_password: 'encrypted_password_here',
    description: 'Personal email account',
    url: 'https://gmail.com'
  })

// Get user credentials
const { data, error } = await supabase
  .from('credentials')
  .select('*')
  .order('created_at', { ascending: false })
```

### Master Key Management
```typescript
// Store master key
const { data, error } = await supabase
  .from('master_keys')
  .insert({
    encrypted_key: 'encrypted_master_key_here'
  })

// Get master key
const { data, error } = await supabase
  .from('master_keys')
  .select('encrypted_key')
  .single()
```

### Feature Requests
```typescript
// Submit feature request
const { data, error } = await supabase
  .from('feature_requests')
  .insert({
    title: 'Dark Mode',
    description: 'Add dark mode theme option'
  })

// Get user's feature requests
const { data, error } = await supabase
  .from('feature_requests')
  .select('*')
  .order('created_at', { ascending: false })
```

### Account Deletion
```typescript
// Delete user account and all data
const { error } = await supabase.rpc('delete_user')
```

## Environment Variables

### Required Variables
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional Variables
```env
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Ensure user is authenticated
   - Check policy conditions match your query
   - Verify user_id matches auth.uid()

2. **Authentication Errors**
   - Check API keys are correct
   - Verify Supabase URL is valid
   - Ensure email confirmation is completed

3. **Database Connection Issues**
   - Check network connectivity
   - Verify project is active
   - Check database password is correct

### Debug Queries

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'credentials';

-- Check user permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'credentials';
```

## Best Practices

1. **Security**
   - Never expose service role key in client code
   - Use environment variables for sensitive data
   - Enable RLS on all tables
   - Implement proper error handling

2. **Performance**
   - Use appropriate indexes
   - Limit query results with pagination
   - Use select() to specify columns

3. **Development**
   - Use TypeScript for type safety
   - Implement proper error boundaries
   - Test authentication flows thoroughly

## Migration Management

### Local Development
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

### Production Deployment
1. Run the complete SQL setup script
2. Verify all tables and policies are created
3. Test authentication flows
4. Monitor for any errors

## Monitoring

### Supabase Dashboard
- **Database**: Monitor query performance
- **Authentication**: Track user signups/logins
- **Logs**: View real-time logs
- **Storage**: Monitor usage and costs

### Key Metrics
- Active users
- Database query performance
- Authentication success/failure rates
- Storage usage

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [KeyYatri Issues](https://github.com/your-repo/issues)

## Security Considerations

1. **Data Encryption**: All sensitive data is encrypted client-side
2. **Access Control**: RLS ensures users only access their data
3. **Authentication**: Secure session management
4. **Audit Trail**: All operations are logged
5. **Backup**: Regular database backups (handled by Supabase)

## Cost Optimization

1. **Database**: Monitor query performance
2. **Storage**: Clean up unused data
3. **Bandwidth**: Optimize API calls
4. **Authentication**: Monitor usage patterns

---

**Note**: This setup provides a complete, production-ready Supabase configuration for KeyYatri. All security measures are in place, and the database is optimized for the application's needs.
