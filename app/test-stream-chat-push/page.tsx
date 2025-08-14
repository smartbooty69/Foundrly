import React from 'react';
import { auth } from '@/auth';
import StreamChatPushNotificationSettings from '@/components/StreamChatPushNotificationSettings';

export default async function TestStreamChatPushPage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to test Stream Chat push notifications</h1>
            <p className="text-gray-600">You need to be logged in to test Stream Chat push notification functionality.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Stream Chat Push Notification Testing</h1>
          <p className="text-gray-600">Test and configure Stream Chat push notifications for messaging</p>
        </div>

        {/* Stream Chat Push Notification Settings */}
        <StreamChatPushNotificationSettings />

        {/* How to Test Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Test Stream Chat Push Notifications</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">1. Enable Push Notifications</h3>
              <p className="text-gray-600 text-sm">
                Click the "Enable Push Notifications" button above. This will:
              </p>
              <ul className="text-gray-600 text-sm mt-2 ml-4 space-y-1">
                <li>• Request notification permission from your browser</li>
                <li>• Register the service worker for Stream Chat</li>
                <li>• Configure Stream Chat to send push notifications</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">2. Test with Real Messages</h3>
              <p className="text-gray-600 text-sm">
                Once enabled, you can test push notifications by:
              </p>
              <ul className="text-gray-600 text-sm mt-2 ml-4 space-y-1">
                <li>• Sending a message in any chat (you'll receive a notification)</li>
                <li>• Receiving a message from someone else</li>
                <li>• Getting reactions to your messages</li>
                <li>• Using the test notification feature above</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">3. Verify Notifications</h3>
              <p className="text-gray-600 text-sm">
                Check that you receive push notifications:
              </p>
              <ul className="text-gray-600 text-sm mt-2 ml-4 space-y-1">
                <li>• When the app is in the background</li>
                <li>• When the app is closed</li>
                <li>• On different devices (if you're logged in)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How It Works</h3>
              <p className="text-gray-600 text-sm">
                Stream Chat push notifications use a dedicated service worker and the Web Push API to deliver 
                real-time notifications for messaging events. This system is completely separate from the 
                general push notification system and is specifically designed for chat functionality.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Service Worker</h3>
              <p className="text-gray-600 text-sm">
                A dedicated service worker (<code className="bg-gray-100 px-1 rounded">sw-stream-chat.js</code>) 
                handles push notifications specifically for Stream Chat. It processes incoming push events 
                and displays notifications with chat-specific formatting and actions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Stream Chat Integration</h3>
              <p className="text-gray-600 text-sm">
                The system integrates directly with Stream Chat's built-in push notification capabilities, 
                ensuring reliable delivery and proper handling of chat-specific events like new messages, 
                replies, and reactions.
              </p>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Troubleshooting</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Common Issues</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>
                  <strong>Notifications not showing:</strong> Check browser notification permissions and ensure 
                  the service worker is registered
                </li>
                <li>
                  <strong>Service worker not loading:</strong> Clear browser cache and reload the page
                </li>
                <li>
                  <strong>Permission denied:</strong> Manually enable notifications in browser settings
                </li>
                <li>
                  <strong>Not working on mobile:</strong> Ensure you're using HTTPS and a supported mobile browser
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Browser Support</h3>
              <p className="text-gray-600 text-sm">
                Stream Chat push notifications work on all modern browsers that support the Web Push API:
                Chrome 42+, Firefox 44+, Safari 16+, and Edge 17+.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
