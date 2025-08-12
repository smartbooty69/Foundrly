import { sendEmail } from './email';
import { client } from '@/sanity/lib/client';

// Interface for user data needed for emails
interface UserData {
  id: string;
  name?: string;
  email?: string;
  username?: string;
}

// Get user data from Sanity
async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const user = await client.getDocument(userId);
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username
    };
  } catch (error) {
    console.error('❌ Failed to get user data for email:', error);
    return null;
  }
}

// Email notification service
export class EmailNotificationService {
  
  // Send account suspended email
  static async sendAccountSuspendedEmail(userId: string, data: {
    reportReason: string;
    actionTaken: string;
    duration?: string;
    strikeNumber?: number;
  }) {
    try {
      const user = await getUserData(userId);
      if (!user?.email) {
        console.log('⚠️ No email found for user:', userId);
        return;
      }

      await sendEmail(user.email, 'accountSuspended', {
        userName: user.name || user.username || 'User',
        ...data
      });

      console.log('✅ Account suspended email sent to:', user.email);
    } catch (error) {
      console.error('❌ Failed to send account suspended email:', error);
    }
  }

  // Send warning email
  static async sendWarningEmail(userId: string, data: {
    contentType: string;
    reportReason: string;
    strikeNumber: number;
  }) {
    try {
      const user = await getUserData(userId);
      if (!user?.email) {
        console.log('⚠️ No email found for user:', userId);
        return;
      }

      await sendEmail(user.email, 'warningIssued', {
        userName: user.name || user.username || 'User',
        ...data
      });

      console.log('✅ Warning email sent to:', user.email);
    } catch (error) {
      console.error('❌ Failed to send warning email:', error);
    }
  }

  // Send permanent ban email
  static async sendPermanentBanEmail(userId: string, data: {
    reportReason: string;
    actionTaken: string;
  }) {
    try {
      const user = await getUserData(userId);
      if (!user?.email) {
        console.log('⚠️ No email found for user:', userId);
        return;
      }

      await sendEmail(user.email, 'permanentBan', {
        userName: user.name || user.username || 'User',
        ...data
      });

      console.log('✅ Permanent ban email sent to:', user.email);
    } catch (error) {
      console.error('❌ Failed to send permanent ban email:', error);
    }
  }

  // Send report submitted confirmation
  static async sendReportSubmittedEmail(userId: string, data: {
    contentType: string;
    reportReason: string;
    timestamp: string;
  }) {
    try {
      const user = await getUserData(userId);
      if (!user?.email) {
        console.log('⚠️ No email found for user:', userId);
        return;
      }

      await sendEmail(user.email, 'reportSubmitted', {
        userName: user.name || user.username || 'User',
        ...data
      });

      console.log('✅ Report submitted email sent to:', user.email);
    } catch (error) {
      console.error('❌ Failed to send report submitted email:', error);
    }
  }

  // Send email for any notification type
  static async sendNotificationEmail(notification: {
    type: string;
    recipientId: string;
    metadata?: any;
    title?: string;
    message?: string;
  }) {
    try {
      const user = await getUserData(notification.recipientId);
      if (!user?.email) {
        console.log('⚠️ No email found for user:', notification.recipientId);
        return;
      }

      // Determine which email template to use based on notification type
      switch (notification.type) {
        case 'report':
          // Check if it's an action against the user
          if (notification.metadata?.actionTaken && 
              (notification.metadata?.reportStatus === 'Warning' || 
               notification.metadata?.reportStatus === 'Suspension' || 
               notification.metadata?.reportStatus === 'Permanent')) {
            
            if (notification.metadata?.reportStatus === 'Suspension') {
              await this.sendAccountSuspendedEmail(notification.recipientId, {
                reportReason: notification.metadata.reportReason || 'Community guidelines violation',
                actionTaken: notification.metadata.actionTaken,
                duration: '7 days',
                strikeNumber: notification.metadata.strikeNumber || 1
              });
            } else if (notification.metadata?.reportStatus === 'Warning') {
              await this.sendWarningEmail(notification.recipientId, {
                contentType: 'Content',
                reportReason: notification.metadata.reportReason || 'Community guidelines violation',
                strikeNumber: notification.metadata.strikeNumber || 1
              });
            } else if (notification.metadata?.reportStatus === 'Permanent') {
              await this.sendPermanentBanEmail(notification.recipientId, {
                reportReason: notification.metadata.reportReason || 'Community guidelines violation',
                actionTaken: notification.metadata.actionTaken
              });
            }
          }
          break;

        default:
          console.log('📧 No email template for notification type:', notification.type);
      }
    } catch (error) {
      console.error('❌ Failed to send notification email:', error);
    }
  }
}

// Helper function to send email for critical notifications
export async function sendCriticalNotificationEmail(notification: any) {
  return EmailNotificationService.sendNotificationEmail(notification);
} 