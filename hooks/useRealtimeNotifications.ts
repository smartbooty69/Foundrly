'use client';

import React, { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface RealtimeNotification {
  type: string;
  recipientId: string;
  title: string;
  message: string;
  metadata?: any;
  timestamp: number;
}

export function useRealtimeNotifications() {
  const { data: session } = useSession();
  const [lastQueuedCount, setLastQueuedCount] = React.useState(0);

  const clearNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/ws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'clear' }),
      });
      
      if (response.ok) {
        console.log('🧹 Notifications cleared successfully');
      } else {
        console.error('❌ Failed to clear notifications');
      }
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  };

  const handleNotification = useCallback((notification: RealtimeNotification) => {
    console.log('🔔 Received real-time notification:', notification);
    
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: `/icons/${notification.type}.svg`,
        tag: `realtime-${notification.type}-${notification.timestamp}`,
        data: notification.metadata
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.metadata?.startupId) {
          window.location.href = `/startup/${notification.metadata.startupId}`;
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Poll for notifications and show them
    const pollForNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/ws');
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Notification service status:', data);
          
          // Only show notification if the count increased (new notifications)
          if (data.queuedCount > lastQueuedCount) {
            const newNotifications = data.queuedCount - lastQueuedCount;
            console.log(`🔔 Found ${newNotifications} new notifications (total: ${data.queuedCount})`);
            
            // Only show polling notification if there are multiple unread notifications (5+)
            if (data.queuedCount >= 5) {
              console.log(`🔔 Multiple notifications detected (${data.queuedCount}), showing summary notification...`);
              
              if ('Notification' in window && Notification.permission === 'granted') {
                // Use unique tag to prevent notification blocking
                const uniqueTag = `polling-notifications-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                const notification = new Notification('You have multiple notifications!', {
                  body: `You have ${data.queuedCount} unread notifications. Check your notification bell!`,
                  icon: '/favicon.ico',
                  tag: uniqueTag,
                  requireInteraction: true, // Keep notification visible until clicked
                  silent: false
                });
                
                notification.onclick = async () => {
                  console.log('🔔 Polling notification clicked, focusing window');
                  window.focus();
                  // Clear notifications to prevent loop
                  await clearNotifications();
                  setLastQueuedCount(data.queuedCount);
                };
                
                notification.onshow = () => {
                  console.log('✅ Polling notification shown successfully');
                  // Mark notifications as seen to prevent loop
                  setLastQueuedCount(data.queuedCount);
                };
                
                notification.onerror = (error) => {
                  console.error('❌ Polling notification error:', error);
                };
                
                notification.onclose = async () => {
                  console.log('🔔 Polling notification closed');
                  // Clear notifications to prevent loop
                  await clearNotifications();
                  setLastQueuedCount(data.queuedCount);
                };
              }
            } else {
              // For fewer notifications, just update the count without showing popup
              console.log(`📝 ${newNotifications} new notification(s) queued (total: ${data.queuedCount}) - individual notifications should show immediately`);
              setLastQueuedCount(data.queuedCount);
            }
          } else {
            // Update the last queued count even if no new notifications
            setLastQueuedCount(data.queuedCount);
          }
        }
      } catch (error) {
        console.error('❌ Failed to check notification service:', error);
      }
    };

    // Poll every 5 seconds for faster response
    const interval = setInterval(pollForNotifications, 5000);
    
    // Initial check
    pollForNotifications();

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  return {
    handleNotification
  };
}
