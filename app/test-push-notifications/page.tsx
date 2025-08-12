'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PushNotificationSettings from '@/components/PushNotificationSettings';

export default function TestPushNotificationsPage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to test push notifications</h1>
          <p className="text-gray-600">You need to be logged in to test push notification functionality.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Push Notification Testing</h1>
          <p className="text-gray-600">Test and configure push notifications for your account</p>
        </div>

        {/* Push Notification Settings */}
        <div className="mb-8">
          <PushNotificationSettings />
        </div>

        {/* Real Testing Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Real Push Notifications</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Once you're subscribed above, test with real activities:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Follow Someone</h3>
                <p className="text-sm text-blue-700">Visit any user profile and click follow</p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Comment on Startup</h3>
                <p className="text-sm text-green-700">Add a comment to any startup</p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Like a Startup</h3>
                <p className="text-sm text-purple-700">Like any startup to trigger notification</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> These activities will create real notifications that appear on your device, 
                even when the app is closed!
              </p>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How Push Notifications Work</h3>
          
          <div className="space-y-3 text-blue-800">
            <p>
              <strong>1. Permission:</strong> Your browser will ask for permission to send notifications
            </p>
            <p>
              <strong>2. Subscription:</strong> Once granted, we create a unique subscription for your device
            </p>
            <p>
              <strong>3. Notifications:</strong> You'll receive real-time notifications for:
            </p>
            
            <ul className="list-disc list-inside ml-6 space-y-1">
              <li>New followers</li>
              <li>Comments on your content</li>
              <li>Likes on your posts</li>
              <li>Moderation updates</li>
              <li>System announcements</li>
            </ul>

            <p>
              <strong>4. Offline Support:</strong> Notifications work even when the app is closed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 