export interface Credential {
  id: string;
  user_id: string;
  name: string;
  username: string;
  encrypted_password: string;
  password: string;
  description?: string;
  created_at: string;
  updated_at: string;
  url?: string;
}

export interface User {
  id: string;
  email: string;
}