import React, { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface FeatureRequestModalProps {
  onCancel: () => void;
}

export const FeatureRequestModal: React.FC<FeatureRequestModalProps> = ({
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('feature_requests')
        .insert([{
          user_id: user.id,
          title: title.trim(),
          description: description.trim()
        }]);

      if (error) throw error;

      toast.success('Feature request submitted successfully');
      onCancel();
    } catch (error) {
      console.error('Error submitting feature request:', error);
      toast.error('Failed to submit feature request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gray-100 rounded-full p-3">
            <MessageSquarePlus className="h-6 w-6 text-gray-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">Request a Feature</h2>
        <p className="text-gray-600 text-center mb-6">
          We'd love to hear your suggestions for improving KeyYatri!
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Feature Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              placeholder="Enter a brief title for your feature request"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              rows={4}
              placeholder="Describe the feature you'd like to see..."
              required
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !description.trim()}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};