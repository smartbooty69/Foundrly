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
      console.log('🔔 Creating test system notification...');
      const response = await fetch('/api/test-create-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🔔 Response:', data);

      if (response.ok) {
        setResult(data);
        console.log('✅ Test system notification created successfully');
      } else {
        setError(data.error || 'Failed to create notification');
        console.error('❌ Failed to create notification:', data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error: ' + errorMessage);
      console.error('❌ Network error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const createTestCommentNotification = async () => {
    if (!session?.user) {
      setError('You must be logged in to create notifications');
      return;
    }

    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔔 Creating test comment notification...');
      const response = await fetch('/api/test-comment-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🔔 Response:', data);

      if (response.ok) {
        setResult(data);
        console.log('✅ Test comment notification created successfully');
      } else {
        setError(data.error || 'Failed to create comment notification');
        console.error('❌ Failed to create comment notification:', data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error: ' + errorMessage);
      console.error('❌ Network error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const createTestRealComment = async () => {
    if (!session?.user) {
      setError('You must be logged in to create notifications');
      return;
    }

    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔔 Creating test real comment notification...');
      const response = await fetch('/api/test-real-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🔔 Response:', data);

      if (response.ok) {
        setResult(data);
        console.log('✅ Test real comment notification created successfully');
      } else {
        setError(data.error || 'Failed to simulate real comment');
        console.error('❌ Failed to simulate real comment:', data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error: ' + errorMessage);
      console.error('❌ Network error:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createTestReplyNotification = async () => {
    if (!session?.user) {
      setError('You must be logged in to create notifications');
      return;
    }

    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔔 Creating test reply notification...');
      const response = await fetch('/api/test-reply-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🔔 Response:', data);

      if (response.ok) {
        setResult(data);
        console.log('✅ Test reply notification created successfully');
      } else {
        const errorMessage = data.error || data.details || 'Failed to create reply notification';
        setError(errorMessage);
        console.error('❌ Failed to create reply notification:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          error: data.error,
          details: data.details
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error: ' + errorMessage);
      console.error('❌ Network error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const createTestCommentLikeNotification = async () => {
    if (!session?.user) {
      setError('You must be logged in to create notifications');
      return;
    }

    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔔 Creating test comment like notification...');
      const response = await fetch('/api/test-comment-like-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🔔 Response:', data);

      if (response.ok) {
        setResult(data);
        console.log('✅ Test comment like notification created successfully');
      } else {
        const errorMessage = data.error || data.details || 'Failed to create comment like notification';
        setError(errorMessage);
        console.error('❌ Failed to create comment like notification:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          error: data.error,
          details: data.details
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error: ' + errorMessage);
      console.error('❌ Network error:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createTestFollowNotification = async () => {
    if (!session?.user) {
      setError('You must be logged in to create notifications');
      return;
    }

    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔔 Creating test follow notification...');
      const response = await fetch('/api/test-follow-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🔔 Response:', data);

      if (response.ok) {
        setResult(data);
        console.log('✅ Test follow notification created successfully');
      } else {
        const errorMessage = data.error || data.details || 'Failed to create follow notification';
        setError(errorMessage);
        console.error('❌ Failed to create follow notification:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          error: data.error,
          details: data.details
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error: ' + errorMessage);
      console.error('❌ Network error:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createTestReportNotification = async () => {
    if (!session?.user) {
      setError('You must be logged in to create notifications');
      return;
    }

    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔔 Creating test report notification...');
      const response = await fetch('/api/test-report-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🔔 Response:', data);

      if (response.ok) {
        setResult(data);
        console.log('✅ Test report notification created successfully');
      } else {
        const errorMessage = data.error || data.details || 'Failed to create report notification';
        setError(errorMessage);
        console.error('❌ Failed to create report notification:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          error: data.error,
          details: data.details,
          fullResponse: data
        });
        
        // Log the full response for debugging
        console.log('🔍 Full API response:', data);
        console.log('🔍 Response status:', response.status);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error: ' + errorMessage);
      console.error('❌ Network error:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const createTestActionAgainstYou = async () => {
    if (!session?.user) {
      setError('You must be logged in to create notifications');
      return;
    }

    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔔 Creating test action against you notification...');
      const response = await fetch('/api/test-action-against-you', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🔔 Response:', data);

      if (response.ok) {
        setResult(data);
        console.log('✅ Test action against you notification created successfully');
      } else {
        const errorMessage = data.error || data.details || 'Failed to create action against you notification';
        setError(errorMessage);
        console.error('❌ Failed to create action against you notification:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          error: data.error,
          details: data.details,
          fullResponse: data
        });
        
        // Log the full response for debugging
        console.log('🔍 Full API response:', data);
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response headers:', response.headers);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error: ' + errorMessage);
      console.error('❌ Network error:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
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

          <div className="mb-6 space-y-3">
            <button
              onClick={createTestNotification}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Test System Notification'}
            </button>
            
            <button
              onClick={createTestCommentNotification}
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors ml-3"
            >
              {isCreating ? 'Creating...' : 'Create Test Comment Notification'}
            </button>
            
            <button
              onClick={createTestRealComment}
              disabled={isCreating}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-lg transition-colors ml-3"
            >
              {isCreating ? 'Creating...' : 'Simulate Real Comment'}
            </button>
            
            <button
              onClick={createTestReplyNotification}
              disabled={isCreating}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium py-2 px-4 rounded-lg transition-colors ml-3"
            >
              {isCreating ? 'Creating...' : 'Test Reply Notification'}
            </button>
            
            <button
              onClick={createTestCommentLikeNotification}
              disabled={isCreating}
              className="bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-medium py-2 px-4 rounded-lg transition-colors ml-3"
            >
              {isCreating ? 'Creating...' : 'Test Comment Like'}
            </button>
            
            <button
              onClick={createTestFollowNotification}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors ml-3"
            >
              {isCreating ? 'Creating...' : 'Test Follow Notification'}
            </button>
            
            <button
              onClick={createTestReportNotification}
              disabled={isCreating}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium py-2 px-4 rounded-lg transition-colors ml-3"
            >
              {isCreating ? 'Creating...' : 'Test Report Notification'}
            </button>
            
            <button
              onClick={createTestActionAgainstYou}
              disabled={isCreating}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors ml-3"
            >
              {isCreating ? 'Creating...' : 'Test Action Against You'}
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
                {result.user && (
                  <p><strong>User:</strong> {result.user.name || result.user.username || 'Unknown'}</p>
                )}
                {result.notificationType && (
                  <p><strong>Type:</strong> {result.notificationType}</p>
                )}
                {result.scenario && (
                  <div className="mt-2 p-2 bg-green-100 rounded">
                    <p><strong>Scenario:</strong></p>
                    <p>• Startup: {result.scenario.startup?.title || 'N/A'}</p>
                    <p>• Comment: {result.scenario.comment || 'N/A'}</p>
                  </div>
                )}
                                 {result.notificationType === 'reply' && (
                   <div className="mt-2 p-2 bg-teal-100 rounded">
                     <p><strong>Reply Details:</strong></p>
                     <p>• Reply: {result.replyText || 'N/A'}</p>
                     <p>• To Comment: {result.parentCommentText || 'N/A'}</p>
                   </div>
                 )}
                 {result.notificationType === 'comment_like' && (
                   <div className="mt-2 p-2 bg-pink-100 rounded">
                     <p><strong>Comment Like Details:</strong></p>
                     <p>• Comment: {result.commentText || 'N/A'}</p>
                     <p>• Startup: {result.startupTitle || 'N/A'}</p>
                   </div>
                 )}
                 {result.notificationType === 'follow' && (
                   <div className="mt-2 p-2 bg-blue-100 rounded">
                     <p><strong>Follow Details:</strong></p>
                     <p>• Follower: {result.followerName || 'N/A'}</p>
                     <p>• Type: New Follower</p>
                   </div>
                 )}
                                   {result.notificationType === 'report' && (
                    <div className="mt-2 p-2 bg-orange-100 rounded">
                      <p><strong>Report Details:</strong></p>
                      <p>• Reason: {result.metadata?.reportReason || 'N/A'}</p>
                      <p>• Status: {result.metadata?.reportStatus || 'N/A'}</p>
                      <p>• Action: {result.metadata?.reportStatus === 'Warning' || result.metadata?.reportStatus === 'Suspension' || result.metadata?.reportStatus === 'Restriction' ? 'Action Taken Against You' : 'N/A'}</p>
                    </div>
                  )}
                  {result.actionDetails && (
                    <div className="mt-2 p-2 bg-red-100 rounded">
                      <p><strong>Action Against You Details:</strong></p>
                      <p>• Title: {result.actionDetails.title || 'N/A'}</p>
                      <p>• Message: {result.actionDetails.message || 'N/A'}</p>
                      <p>• Severity: {result.actionDetails.severity || 'N/A'}</p>
                      <p>• Action: {result.actionDetails.actionTaken || 'N/A'}</p>
                    </div>
                  )}
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