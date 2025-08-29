import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  name: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  onConfirm,
  onCancel,
  name,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">Delete Credential</h2>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete "{name}"? This action cannot be undone.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
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