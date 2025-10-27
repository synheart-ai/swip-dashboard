/**
 * Register New App Modal
 *
 * Modal for registering a new application
 */

'use client';

import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface RegisterAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RegisterAppModal({ isOpen, onClose, onSuccess }: RegisterAppModalProps) {
  const [formData, setFormData] = useState({
    appName: '',
    appUrl: '',
    applicationId: '',
    packageName: '',
    environment: 'Production',
    category: 'Category',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.appName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to register app');
      }

      // Reset form
      setFormData({
        appName: '',
        appUrl: '',
        applicationId: '',
        packageName: '',
        environment: 'Production',
        category: 'Category',
        description: '',
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Icon and Title */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-synheart-pink to-synheart-blue flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Register New App</h2>
          <p className="text-gray-400 text-sm">
            Create a new application to integrate with SWIP's intelligence platform.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* App Name and URL */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="App Name"
              placeholder="My Wellness App"
              value={formData.appName}
              onChange={(e) => handleChange('appName', e.target.value)}
              required
            />
            <Input
              label="App URL"
              placeholder="https://myapp.com"
              value={formData.appUrl}
              onChange={(e) => handleChange('appUrl', e.target.value)}
            />
          </div>

          {/* Application ID and Package Name */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Application ID (iOS)"
              placeholder="com.example.myapp"
              value={formData.applicationId}
              onChange={(e) => handleChange('applicationId', e.target.value)}
            />
            <Input
              label="Android Package Name"
              placeholder="com.example.myapp"
              value={formData.packageName}
              onChange={(e) => handleChange('packageName', e.target.value)}
            />
          </div>

          {/* Environment and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Environment
              </label>
              <select
                value={formData.environment}
                onChange={(e) => handleChange('environment', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent"
              >
                <option>Production</option>
                <option>Staging</option>
                <option>Development</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent"
              >
                <option>Category</option>
                <option>Meditation</option>
                <option>Fitness</option>
                <option>Sleep</option>
                <option>Mental Health</option>
                <option>Nutrition</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              placeholder="A brief description of your app"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!formData.appName}
            >
              Register App
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
