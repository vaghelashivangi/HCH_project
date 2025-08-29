import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EditProfileModalProps {
  email: string;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  email,
  onClose,
}) => {
  const [newEmail, setNewEmail] = useState(email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update email if changed
      if (newEmail !== email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: newEmail
        });
        if (emailError) throw emailError;
        toast.success('Email updated successfully. Please check your inbox for confirmation.');
      }

      // Update password if provided
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (passwordError) throw passwordError;
        toast.success('Password updated successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-colors duration-200 sm:text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
              New Password (optional)
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-colors duration-200 pr-12 sm:text-sm"
                minLength={6}
                placeholder="Leave blank to keep current"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {newPassword && (
              <p className="text-sm text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};