"use client";

import React, { useState } from 'react';
import { useStreamChatPushNotifications } from '@/hooks/useStreamChatPushNotifications';

export default function StreamChatPushNotificationSettings() {
  const {
    isSupported,
    isRegistered,
    isEnabled,
    isLoading,
    error,
    settings,
    registerForPushNotifications,
    unregisterFromPushNotifications,
    updateSettings,
    sendTestNotification
  } = useStreamChatPushNotifications();

  const [testMessage, setTestMessage] = useState('Hello! This is a test message from Stream Chat.');
  const [testChannelId, setTestChannelId] = useState('');

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-yellow-800 font-medium">
            Push notifications are not supported in this browser
          </span>
        </div>
        <p className="text-yellow-700 text-sm mt-1">
          Please use a modern browser like Chrome, Firefox, Safari, or Edge to enable push notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <svg className="w-6 h-6 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c-.28.28-.732.28-1.012 0L6 12.828V12a2 2 0 00-2-2H4a2 2 0 01-2-2V6a2 2 0 012-2h7a2 2 0 012 2v1z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Stream Chat Push Notifications</h3>
      </div>

      <p className="text-gray-600 mb-4">
        Enable push notifications to receive real-time alerts when you get new messages, replies, or reactions in your chats.
      </p>

      {/* Status Display */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium text-gray-700">
            {isEnabled ? 'Push notifications enabled' : 'Push notifications disabled'}
          </span>
        </div>
        {isRegistered && (
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">Registered with Stream Chat</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {!isEnabled ? (
          <button
            onClick={registerForPushNotifications}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enabling...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enable Push Notifications
              </>
            )}
          </button>
        ) : (
          <button
            onClick={unregisterFromPushNotifications}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Disabling...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Disable Push Notifications
              </>
            )}
          </button>
        )}
      </div>

      {/* Test Notification Section */}
      {isEnabled && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Test Push Notifications</h4>
          <p className="text-gray-600 text-sm mb-4">
            Send a test push notification to verify everything is working correctly.
          </p>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="testChannelId" className="block text-sm font-medium text-gray-700 mb-1">
                Channel ID (optional)
              </label>
              <input
                type="text"
                id="testChannelId"
                value={testChannelId}
                onChange={(e) => setTestChannelId(e.target.value)}
                placeholder="Enter channel ID or leave empty for default"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="testMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Test Message
              </label>
              <textarea
                id="testMessage"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your test message..."
              />
            </div>
            
            <button
              onClick={() => sendTestNotification(testChannelId || 'test-channel', testMessage)}
              disabled={isLoading || !testMessage.trim()}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Send Test Notification
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Settings Display */}
      {settings && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Current Settings</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <pre className="text-xs text-gray-700 overflow-x-auto">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h5 className="text-sm font-medium text-blue-900">How it works</h5>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Push notifications work even when the app is closed</li>
              <li>• You'll receive notifications for new messages, replies, and reactions</li>
              <li>• Notifications are handled by Stream Chat's built-in system</li>
              <li>• Click on notifications to open the relevant chat</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
