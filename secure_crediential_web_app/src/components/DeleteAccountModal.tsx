import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteAccountModalProps {
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [password, setPassword] = useState('');

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">Delete Account</h2>
        <p className="text-gray-600 text-center mb-6">
          This action cannot be undone. All your data will be permanently deleted.
        </p>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your password to confirm
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onConfirm(password)}
            disabled={!password}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Account
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};