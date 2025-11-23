'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Share2,
  Settings,
  MessageSquare,
  Bell,
  Eye,
  Edit,
  Crown,
  Mail,
  Link,
  Copy,
  Check,
  Clock,
  Activity,
  Shield,
  Globe,
  Lock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CollaborativeWorkspace, WorkspaceUser } from '../types/export-v4';
import { exportSystemV4 } from '../lib/export-system-v4';

interface CollaborationHubProps {
  workspace: CollaborativeWorkspace;
}

interface ActivityItem {
  id: string;
  type: 'user_joined' | 'export_created' | 'settings_changed' | 'share_created';
  user: string;
  description: string;
  timestamp: string;
}

export const CollaborationHub: React.FC<CollaborationHubProps> = ({ workspace: initialWorkspace }) => {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'settings' | 'sharing'>('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    generateShareLink();
    loadActivities();
  }, []);

  const generateShareLink = () => {
    const link = `https://expense-tracker.app/workspace/${workspace.id}?token=demo-token`;
    setShareLink(link);
  };

  const loadActivities = () => {
    // Mock activity data
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'user_joined',
        user: 'John Doe',
        description: 'joined the workspace',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'export_created',
        user: 'You',
        description: 'created a PDF export',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'settings_changed',
        user: 'Jane Smith',
        description: 'updated workspace settings',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setActivities(mockActivities);
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const success = exportSystemV4.getCollaboration().inviteUser(workspace.id, inviteEmail, inviteRole);
      
      if (success) {
        toast.success(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
        
        // Update workspace state
        const updatedWorkspace = exportSystemV4.getCollaboration().getWorkspace(workspace.id);
        if (updatedWorkspace) {
          setWorkspace(updatedWorkspace);
        }

        // Add activity
        const newActivity: ActivityItem = {
          id: Date.now().toString(),
          type: 'user_joined',
          user: inviteEmail,
          description: `was invited as ${inviteRole}`,
          timestamp: new Date().toISOString()
        };
        setActivities([newActivity, ...activities]);
      } else {
        toast.error('Failed to send invitation');
      }
    } catch (error) {
      toast.error('Failed to invite user');
      console.error('Invite error:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      toast.success('Share link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleUpdatePermissions = (userId: string, newRole: 'owner' | 'editor' | 'viewer') => {
    const updatedUsers = workspace.users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    );
    
    setWorkspace({
      ...workspace,
      users: updatedUsers,
      updatedAt: new Date().toISOString()
    });

    toast.success('Permissions updated');
  };

  const handleRemoveUser = (userId: string) => {
    const updatedUsers = workspace.users.filter(user => user.id !== userId);
    
    setWorkspace({
      ...workspace,
      users: updatedUsers,
      updatedAt: new Date().toISOString()
    });

    toast.success('User removed from workspace');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_joined':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'export_created':
        return <Share2 className="w-4 h-4 text-blue-500" />;
      case 'settings_changed':
        return <Settings className="w-4 h-4 text-purple-500" />;
      case 'share_created':
        return <Link className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMembersTab = () => (
    <div className="space-y-6">
      {/* Invite Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Invite Team Members</h3>
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleInviteUser()}
            />
          </div>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button
            onClick={handleInviteUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Invite
          </button>
        </div>
      </div>

      {/* Current Members */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Current Members ({workspace.users.length})
        </h3>
        <div className="space-y-3">
          {workspace.users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1 capitalize">{user.role}</span>
                  </span>
                  {user.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {user.role !== 'owner' && (
                  <>
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdatePermissions(user.id, e.target.value as any)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span> {activity.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(activity.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderSharingTab = () => (
    <div className="space-y-6">
      {/* Share Link */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Share Workspace</h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{linkCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Anyone with this link can view the workspace according to their permissions.
        </p>
      </div>

      {/* Access Level */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Access Level</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="accessLevel"
              value="private"
              checked={workspace.permissions.accessLevel === 'private'}
              onChange={() => {/* Handle change */}}
              className="h-4 w-4 text-blue-600"
            />
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Private</p>
                <p className="text-xs text-gray-500">Only invited members can access</p>
              </div>
            </div>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="accessLevel"
              value="public"
              checked={workspace.permissions.accessLevel === 'public'}
              onChange={() => {/* Handle change */}}
              className="h-4 w-4 text-blue-600"
            />
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Public</p>
                <p className="text-xs text-gray-500">Anyone with the link can view</p>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Workspace Settings */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Workspace Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-save</p>
              <p className="text-xs text-gray-500">Automatically save changes</p>
            </div>
            <input
              type="checkbox"
              checked={workspace.settings.autoSave}
              onChange={() => {/* Handle change */}}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Real-time sync</p>
              <p className="text-xs text-gray-500">Sync changes in real-time</p>
            </div>
            <input
              type="checkbox"
              checked={workspace.settings.realTimeSync}
              onChange={() => {/* Handle change */}}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Export history</p>
              <p className="text-xs text-gray-500">Keep track of all exports</p>
            </div>
            <input
              type="checkbox"
              checked={workspace.settings.exportHistory}
              onChange={() => {/* Handle change */}}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">AI insights</p>
              <p className="text-xs text-gray-500">Enable AI-powered insights</p>
            </div>
            <input
              type="checkbox"
              checked={workspace.settings.aiInsights}
              onChange={() => {/* Handle change */}}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Email notifications</p>
              <p className="text-xs text-gray-500">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              checked={workspace.settings.notifications.email}
              onChange={() => {/* Handle change */}}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Browser notifications</p>
              <p className="text-xs text-gray-500">Show browser notifications</p>
            </div>
            <input
              type="checkbox"
              checked={workspace.settings.notifications.browser}
              onChange={() => {/* Handle change */}}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-medium text-red-900 mb-3">Danger Zone</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Delete Workspace</p>
              <p className="text-xs text-red-700 mt-1">
                This will permanently delete the workspace and all associated data. This action cannot be undone.
              </p>
              <button className="mt-3 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{workspace.name}</h2>
          <p className="text-gray-600">{workspace.description || 'Collaborative expense tracking workspace'}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            workspace.permissions.accessLevel === 'private' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {workspace.permissions.accessLevel === 'private' ? <Lock className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
            {workspace.permissions.accessLevel}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'members', label: 'Members', icon: Users },
          { id: 'activity', label: 'Activity', icon: Activity },
          { id: 'sharing', label: 'Sharing', icon: Share2 },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'sharing' && renderSharingTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};