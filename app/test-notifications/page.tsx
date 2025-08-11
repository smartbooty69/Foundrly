'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestNotificationsPage() {
  const { data: session } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestNotification = async () => {
    if (!session?.user) {
      setError('You must be logged in to create notifications');
      return;
    }

    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-create-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to create notification');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Test Notifications
          </h1>
          <p className="text-gray-600">
            Please log in to test the notification system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test Notification System
          </h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Current User
            </h2>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>ID:</strong> {session.user.id}</p>
              <p><strong>Name:</strong> {session.user.name || 'N/A'}</p>
              <p><strong>Username:</strong> {session.user.username || 'N/A'}</p>
              <p><strong>Email:</strong> {session.user.email || 'N/A'}</p>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={createTestNotification}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Test Notification'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-medium mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-green-800 font-medium mb-2">Success!</h3>
              <div className="text-green-700">
                <p><strong>Message:</strong> {result.message}</p>
                <p><strong>Notification ID:</strong> {result.notificationId}</p>
                <p><strong>User:</strong> {result.user.name}</p>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-blue-800 font-medium mb-2">Next Steps</h3>
            <ol className="text-blue-700 list-decimal list-inside space-y-1">
              <li>Click the button above to create a test notification</li>
              <li>Check your notifications page to see if it appears</li>
              <li>Try liking a startup to create real like notifications</li>
              <li>Test marking notifications as read</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 