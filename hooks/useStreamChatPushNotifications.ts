"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { streamChatPushService } from '@/lib/streamChatPushNotifications';

export interface StreamChatPushState {
  isSupported: boolean;
  isRegistered: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  settings: any;
}

export function useStreamChatPushNotifications() {
  const { data: session } = useSession();
  const [state, setState] = useState<StreamChatPushState>({
    isSupported: false,
    isRegistered: false,
    isEnabled: false,
    isLoading: false,
    error: null,
    settings: null
  });

  // Check if push notifications are supported
  useEffect(() => {
    const isSupported = streamChatPushService.isSupported();
    setState(prev => ({ ...prev, isSupported }));
  }, []);

  // Initialize Stream Chat client when session is available
  useEffect(() => {
    if (session?.user?.id && state.isSupported) {
      initializeStreamChat();
    }
  }, [session?.user?.id, state.isSupported]);

  // Initialize Stream Chat client
  const initializeStreamChat = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get Stream Chat token
      const response = await fetch('/api/chat/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id })
      });

      if (!response.ok) {
        throw new Error('Failed to get Stream Chat token');
      }

      const { token } = await response.json();
      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

      // Initialize Stream Chat client
      await streamChatPushService.initialize(apiKey, session.user.id, token);

      // Get current push notification settings
      const settings = await streamChatPushService.getPushNotificationSettings();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        settings,
        isEnabled: settings?.push?.enabled || false,
        isRegistered: true
      }));

    } catch (error) {
      console.error('❌ Failed to initialize Stream Chat:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize Stream Chat'
      }));
    }
  }, [session?.user?.id]);

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    if (!session?.user?.id) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const success = await streamChatPushService.registerForPushNotifications();
      
      if (success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isRegistered: true,
          isEnabled: true,
          error: null
        }));
        return true;
      } else {
        throw new Error('Failed to register for push notifications');
      }
    } catch (error) {
      console.error('❌ Failed to register for push notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to register for push notifications'
      }));
      return false;
    }
  }, [session?.user?.id]);

  // Unregister from push notifications
  const unregisterFromPushNotifications = useCallback(async () => {
    if (!session?.user?.id) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const success = await streamChatPushService.unregisterFromPushNotifications();
      
      if (success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isRegistered: false,
          isEnabled: false,
          error: null
        }));
        return true;
      } else {
        throw new Error('Failed to unregister from push notifications');
      }
    } catch (error) {
      console.error('❌ Failed to unregister from push notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to unregister from push notifications'
      }));
      return false;
    }
  }, [session?.user?.id]);

  // Update push notification settings
  const updateSettings = useCallback(async (newSettings: any) => {
    if (!session?.user?.id) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const success = await streamChatPushService.updatePushNotificationSettings(newSettings);
      
      if (success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          settings: newSettings,
          error: null
        }));
        return true;
      } else {
        throw new Error('Failed to update push notification settings');
      }
    } catch (error) {
      console.error('❌ Failed to update push notification settings:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update push notification settings'
      }));
      return false;
    }
  }, [session?.user?.id]);

  // Send test push notification
  const sendTestNotification = useCallback(async (channelId: string, message: string) => {
    if (!session?.user?.id) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const success = await streamChatPushService.sendPushNotification(channelId, message, session.user.id);
      
      if (success) {
        setState(prev => ({ ...prev, isLoading: false, error: null }));
        return true;
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('❌ Failed to send test notification:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send test notification'
      }));
      return false;
    }
  }, [session?.user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamChatPushService.disconnect();
    };
  }, []);

  return {
    ...state,
    registerForPushNotifications,
    unregisterFromPushNotifications,
    updateSettings,
    sendTestNotification,
    initializeStreamChat
  };
}
