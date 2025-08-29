# Database Documentation

## Schema Overview

### Credentials Table
Stores encrypted user credentials with the following structure:
```sql
CREATE TABLE credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  description TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Master Keys Table
Stores encrypted master keys for users:
```sql
CREATE TABLE master_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Feature Requests Table
Stores user feature requests:
```sql
CREATE TABLE feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Credentials Table Policies
- Users can only view their own credentials
- Users can only create credentials for themselves
- Users can only update their own credentials
- Users can only delete their own credentials

### Master Keys Table Policies
- Users can only view their own master key
- Users can only create/update their own master key
- Users can only delete their own master key

### Feature Requests Table Policies
- Users can create feature requests
- Users can only view their own feature requests

## Encryption

- Passwords are encrypted using AES encryption
- The master key is used as the encryption key
- The master key itself is encrypted before storage
- All encryption/decryption happens client-side

## Best Practices

1. Always use parameterized queries
2. Never store plain text passwords
3. Keep the master key secure
4. Regular backups are recommended
5. Monitor database performance

## Maintenance

### Indexes
The following indexes are automatically created:
- Primary key indexes on all tables
- Foreign key indexes on user_id columns

### Updates
When updating the schema:
1. Create a new migration file
2. Test the migration in a development environment
3. Apply the migration in production
4. Update application code as needed