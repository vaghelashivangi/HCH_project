import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PasswordStrength } from './PasswordStrength';

interface CredentialFormProps {
  onSubmit: (data: {
    name: string;
    username: string;
    password: string;
    description?: string;
    url?: string;
  }) => void;
  isLoading?: boolean;
}

export const CredentialForm: React.FC<CredentialFormProps> = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    description: '',
    url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.password) {
      return;
    }
    onSubmit({
      ...formData,
      name: formData.name.trim(),
      username: formData.username.trim(),
      description: formData.description.trim(),
      url: formData.url.trim()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Gmail Account"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username/Email</label>
        <input
          id="username"
          name="username"
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          value={formData.username}
          onChange={handleChange}
          placeholder="e.g., user@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 pr-24 sm:text-sm"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              type="button"
              onClick={generatePassword}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
            >
              Generate
            </button>
            <button
              type="button"
              className="pr-3 pl-2 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>
        <div className="mt-2">
          <PasswordStrength password={formData.password} />
        </div>
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">URL (optional)</label>
        <input
          id="url"
          name="url"
          type="url"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          value={formData.url}
          onChange={handleChange}
          placeholder="e.g., https://example.com"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Add notes or additional information"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.name.trim() || !formData.username.trim() || !formData.password}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Save Credential'}
      </button>
    </form>
  );
};