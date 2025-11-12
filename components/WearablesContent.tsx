/**
 * Wearables Content Component
 * 
 * Main content area for wearables management with filtering and add functionality
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';

interface Wearable {
  id: string;
  name: string;
  deviceType: string;
  model: string | null;
  deviceId: string | null;
  connectionStatus: string;
  lastSyncAt: string | null;
  batteryLevel: number | null;
  assignedUserId: string | null;
  createdAt: string;
  sessionsCount: number;
}

interface WearablesContentProps {
  projectId: string;
  projectName: string;
}

export function WearablesContent({ projectId, projectName }: WearablesContentProps) {
  const [wearables, setWearables] = useState<Wearable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Filters
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWearables = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (deviceTypeFilter !== 'all') {
        params.append('deviceType', deviceTypeFilter);
      }
      if (statusFilter !== 'all') {
        params.append('connectionStatus', statusFilter);
      }

      const response = await fetch(`/api/projects/${projectId}/wearables?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch wearables');
      }

      let filtered = data.data || [];
      
      // Client-side search filter
      if (searchQuery.trim()) {
        filtered = filtered.filter((w: Wearable) =>
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.deviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (w.model && w.model.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setWearables(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load wearables');
      console.error('Error fetching wearables:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, deviceTypeFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchWearables();
  }, [fetchWearables]);

  const handleWearableCreated = () => {
    fetchWearables();
  };

  const statusColors: Record<string, string> = {
    connected: 'bg-green-500/20 text-green-400 border-green-500/30',
    disconnected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    needs_setup: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  const deviceTypes = Array.from(new Set(wearables.map(w => w.deviceType)));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/projects" className="hover:text-white transition-colors">
            Projects
          </Link>
          <span>/</span>
          <Link href={`/projects/${projectId}`} className="hover:text-white transition-colors">
            {projectName}
          </Link>
          <span>/</span>
          <span className="text-white">Wearables</span>
        </div>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Wearables</h1>
            <p className="text-gray-400">Manage wearable devices for {projectName}</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className='flex items-center'>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Wearable
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <Input
                placeholder="Search wearables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Device Type Filter */}
            <div>
              <select
                value={deviceTypeFilter}
                onChange={(e) => setDeviceTypeFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent"
              >
                <option value="all">All Device Types</option>
                {deviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="connected">Connected</option>
                <option value="disconnected">Disconnected</option>
                <option value="needs_setup">Needs Setup</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Wearables List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading wearables...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchWearables}>
            Try Again
          </Button>
        </div>
      ) : wearables.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No wearables found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || deviceTypeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first wearable device'}
          </p>
          {!searchQuery && deviceTypeFilter === 'all' && statusFilter === 'all' && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add Your First Wearable
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wearables.map((wearable) => (
            <div
              key={wearable.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{wearable.name}</h3>
                  <p className="text-sm text-gray-400">{wearable.deviceType}</p>
                  {wearable.model && (
                    <p className="text-xs text-gray-500 mt-1">{wearable.model}</p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  statusColors[wearable.connectionStatus] || statusColors.disconnected
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {wearable.connectionStatus}
                </span>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Sessions</span>
                  <span className="text-white font-medium">{wearable.sessionsCount}</span>
                </div>
                {wearable.batteryLevel !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Battery</span>
                    <span className="text-white font-medium">{wearable.batteryLevel}%</span>
                  </div>
                )}
                {wearable.lastSyncAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Sync</span>
                    <span className="text-white font-medium text-xs">
                      {new Date(wearable.lastSyncAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <Link href={`/projects/${projectId}/sessions?wearableId=${wearable.id}`}>
                  <Button variant="outline" size="sm" fullWidth>
                    View Sessions
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Wearable Modal */}
      <AddWearableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleWearableCreated}
        projectId={projectId}
      />
    </div>
  );
}

// Add Wearable Modal Component
interface AddWearableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
}

function AddWearableModal({ isOpen, onClose, onSuccess, projectId }: AddWearableModalProps) {
  const [name, setName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [model, setModel] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('needs_setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deviceTypes = [
    'Apple Watch',
    'Garmin',
    'Fitbit',
    'Whoop',
    'Oura',
    'Polar',
    'Samsung Galaxy Watch',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/wearables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          deviceType: deviceType || 'Other',
          model: model.trim() || undefined,
          deviceId: deviceId.trim() || undefined,
          connectionStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create wearable');
      }

      // Reset form
      setName('');
      setDeviceType('');
      setModel('');
      setDeviceId('');
      setConnectionStatus('needs_setup');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create wearable');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDeviceType('');
      setModel('');
      setDeviceId('');
      setConnectionStatus('needs_setup');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Wearable"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Wearable Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Apple Watch #12"
          required
          maxLength={100}
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Device Type <span className="text-red-500">*</span>
          </label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select device type...</option>
            {deviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <Input
          label="Model (Optional)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g., Apple Watch Series 11"
          maxLength={100}
          disabled={loading}
        />

        <Input
          label="Device ID (Optional)"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          placeholder="External device identifier"
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Connection Status
          </label>
          <select
            value={connectionStatus}
            onChange={(e) => setConnectionStatus(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-synheart-pink focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="needs_setup">Needs Setup</option>
            <option value="connected">Connected</option>
            <option value="disconnected">Disconnected</option>
          </select>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!name.trim() || !deviceType}
          >
            Add Wearable
          </Button>
        </div>
      </form>
    </Modal>
  );
}

