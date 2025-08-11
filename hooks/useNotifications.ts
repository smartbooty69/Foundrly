import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Notification } from '@/components/NotificationBell';

export const useNotifications = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (limit: number = 50, offset: number = 0) => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (offset === 0) {
        // First load - replace all notifications
        setNotifications(data.notifications || []);
      } else {
        // Load more - append to existing notifications
        setNotifications(prev => [...prev, ...(data.notifications || [])]);
      }
      
      setUnreadCount(data.unreadCount || 0);
      setHasMore(data.hasMore || false);
      setTotal(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      
      // Fallback to mock data for UI testing
      if (offset === 0) {
        const mockNotifications = [
          {
            id: 'mock-1',
            type: 'system' as const,
            title: 'Welcome to Foundrly!',
            message: 'Your notification system is now active.',
            timestamp: new Date().toISOString(),
            isRead: false
          }
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(1);
        setHasMore(false);
        setTotal(1);
        
        console.log('Using mock notifications for UI testing. Fix Sanity connection to see real data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await fetchNotifications(50, notifications.length);
    }
  }, [hasMore, isLoading, notifications.length, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to mark notification as read: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Mark as read response:', result);

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log('Successfully marked notification as read:', notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error; // Re-throw to let the UI handle it
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      console.log('Marking all notifications as read');
      
      const response = await fetch('/api/notifications', {
        method: 'PATCH'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to mark all notifications as read: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Mark all as read response:', result);

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      console.log('Successfully marked all notifications as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error; // Re-throw to let the UI handle it
    }
  }, []);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
    setTotal(prev => prev + 1);
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
    setTotal(prev => Math.max(0, prev - 1));
  }, []);

  // Update notification
  const updateNotification = useCallback((notificationId: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, ...updates } : n
      )
    );
    
    // Update unread count if read status changed
    if ('isRead' in updates) {
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && notification.isRead !== updates.isRead) {
          return updates.isRead ? prev - 1 : prev + 1;
        }
        return prev;
      });
    }
  }, [notifications]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.isRead);
  }, [notifications]);

  // Check if user has unread notifications
  const hasUnreadNotifications = useCallback(() => {
    return unreadCount > 0;
  }, [unreadCount]);

  // Refresh notifications
  const refresh = useCallback(async () => {
    await fetchNotifications(50, 0);
  }, [fetchNotifications]);

  // Initialize notifications on mount
  useEffect(() => {
    if (session?.user) {
      fetchNotifications(50, 0);
    }
  }, [session?.user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    total,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    updateNotification,
    getNotificationsByType,
    getUnreadNotifications,
    hasUnreadNotifications,
    refresh
  };
}; 