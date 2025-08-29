# Secure Crediential Web Application 
Secure Crediential Web Application is a secure password manager built with React, Node.js, and Supabase. It provides a clean, user-friendly interface for storing and managing your passwords with strong encryption.

## Features

- 🔐 Secure password storage with AES encryption
- 👤 User authentication with email/password
- 🔑 Master key encryption for additional security
- 🔍 Search functionality for quick access to credentials
- 📊 Password strength meter
- 🎨 Clean black and white theme
- 📱 Responsive design

## Security Features

- AES encryption for all stored passwords
- Master key requirement for encryption/decryption
- Secure authentication through Supabase
- Password strength checking with zxcvbn
- Clipboard clearing
- Session management

## Prerequisites

- Node.js 14+
- Supabase account

## Setup

1. Create a new Supabase project

2. Create the following tables in your Supabase database:

```sql
-- Create credentials table
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

-- Enable RLS
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own credentials"
  ON credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own credentials"
  ON credentials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
  ON credentials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
  ON credentials
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

3. Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Install dependencies:

```bash
npm install
```

5. Start the development server:

```bash
npm run dev
```

## Usage

1. Create an account or sign in
2. Set your master key (remember this key as it's required for encryption/decryption)
3. Add your credentials
4. Use the search function to find specific credentials
5. Click "Copy Password" to copy passwords to clipboard

## Security Best Practices

1. Use a strong master key
2. Never share your master key
3. Use unique passwords for each service
4. Enable 2FA where possible
5. Regularly update your passwords

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
