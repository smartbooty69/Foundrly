import { StreamChat } from 'stream-chat';
import crypto from 'crypto';

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Inappropriate content patterns
const INAPPROPRIATE_PATTERNS = {
  // Profanity and offensive language
  profanity: [
    /\b(fuck|shit|bitch|asshole|dick|pussy|cunt|cock|whore|slut)\b/gi,
    /\b(f\*ck|s\*it|b\*tch|a\*shole|d\*ck|p\*ssy|c\*nt|c\*ck|wh\*re|sl\*t)\b/gi,
  ],
  
  // Hate speech and discrimination
  hateSpeech: [
    /\b(nigger|nigga|faggot|fag|dyke|kike|spic|chink|gook|wetback)\b/gi,
    /\b(n\*gger|n\*gga|f\*ggot|f\*g|d\*ke|k\*ke|sp\*c|ch\*nk|g\*ok|wetb\*ck)\b/gi,
  ],
  
  // Threats and violence
  threats: [
    /\b(kill|murder|suicide|bomb|shoot|attack|hurt|harm|beat|stab)\b/gi,
    /\b(i will kill|i'll kill|going to kill|gonna kill)\b/gi,
  ],
  
  // Spam patterns
  spam: [
    /\b(buy now|click here|free money|make money|earn cash|work from home)\b/gi,
    /\b(www\.|http:\/\/|https:\/\/)\S+/gi, // URLs
    /\b\d{10,}\b/g, // Long numbers (phone numbers)
  ],
  
  // Personal information
  personalInfo: [
    /\b\d{3}-\d{3}-\d{4}\b/g, // Phone numbers
    /\b\d{5}-\d{4}\b/g, // SSN
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
  ],
};

// Moderation severity levels
export enum ModerationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Moderation action types
export enum ModerationAction {
  WARN = 'warn',
  DELETE = 'delete',
  BAN = 'ban',
  REPORT = 'report',
}

// Moderation result interface
export interface ModerationResult {
  isFlagged: boolean;
  severity: ModerationSeverity;
  action: ModerationAction;
  reason: string;
  patterns: string[];
  confidence: number;
}

// Content moderation function
export function moderateContent(text: string): ModerationResult {
  const detectedPatterns: string[] = [];
  let severity = ModerationSeverity.LOW;
  let action = ModerationAction.WARN;
  let reason = '';
  let confidence = 0;

  // Check for inappropriate patterns
  for (const [category, patterns] of Object.entries(INAPPROPRIATE_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        detectedPatterns.push(category);
        confidence += matches.length * 0.2;
        
        // Determine severity based on category
        switch (category) {
          case 'hateSpeech':
            severity = ModerationSeverity.CRITICAL;
            action = ModerationAction.BAN;
            reason = 'Hate speech detected';
            break;
          case 'threats':
            severity = ModerationSeverity.HIGH;
            action = ModerationAction.REPORT;
            reason = 'Threats or violence detected';
            break;
          case 'profanity':
            if (severity === ModerationSeverity.LOW) {
              severity = ModerationSeverity.MEDIUM;
              action = ModerationAction.DELETE;
              reason = 'Inappropriate language detected';
            }
            break;
          case 'spam':
            severity = ModerationSeverity.MEDIUM;
            action = ModerationAction.DELETE;
            reason = 'Spam content detected';
            break;
          case 'personalInfo':
            severity = ModerationSeverity.HIGH;
            action = ModerationAction.DELETE;
            reason = 'Personal information detected';
            break;
        }
      }
    }
  }

  // Check message length for potential spam
  if (text.length > 500) {
    detectedPatterns.push('longMessage');
    confidence += 0.1;
    if (severity === ModerationSeverity.LOW) {
      severity = ModerationSeverity.MEDIUM;
      action = ModerationAction.WARN;
      reason = 'Very long message detected';
    }
  }

  // Check for excessive repetition
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts: { [key: string]: number } = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  const repeatedWords = Object.entries(wordCounts)
    .filter(([_, count]) => count > 3)
    .map(([word, _]) => word);
    
  if (repeatedWords.length > 0) {
    detectedPatterns.push('repetition');
    confidence += 0.15;
    if (severity === ModerationSeverity.LOW) {
      severity = ModerationSeverity.MEDIUM;
      action = ModerationAction.WARN;
      reason = 'Excessive repetition detected';
    }
  }

  // Check for all caps (shouting)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.7 && text.length > 10) {
    detectedPatterns.push('shouting');
    confidence += 0.1;
    if (severity === ModerationSeverity.LOW) {
      severity = ModerationSeverity.MEDIUM;
      action = ModerationAction.WARN;
      reason = 'Excessive caps detected';
    }
  }

  return {
    isFlagged: detectedPatterns.length > 0,
    severity,
    action,
    reason,
    patterns: detectedPatterns,
    confidence: Math.min(confidence, 1.0),
  };
}

// Auto moderation handler for Stream Chat
export class StreamChatModeration {
  private client: StreamChat;
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.client = StreamChat.getInstance(apiKey, apiSecret);
  }

  // Handle new message moderation
  async handleMessageModeration(
    channelId: string,
    messageId: string,
    userId: string,
    text: string
  ): Promise<void> {
    const moderationResult = moderateContent(text);

    if (!moderationResult.isFlagged) {
      return; // No moderation needed
    }

    try {
      const channel = this.client.channel('messaging', channelId);
      
      switch (moderationResult.action) {
        case ModerationAction.DELETE:
          await this.deleteMessage(channelId, messageId, moderationResult.reason);
          break;
          
        case ModerationAction.BAN:
          await this.deleteMessage(channelId, messageId, moderationResult.reason);
          await this.banUser(userId, moderationResult.reason);
          break;
          
        case ModerationAction.REPORT:
          await this.reportMessage(channelId, messageId, moderationResult);
          break;
          
        case ModerationAction.WARN:
        default:
          await this.warnUser(channelId, userId, moderationResult);
          break;
      }
    } catch (error) {
      console.error('Error in message moderation:', error);
    }
  }

  // Delete inappropriate message
  private async deleteMessage(channelId: string, messageId: string, reason: string): Promise<void> {
    try {
      const channel = this.client.channel('messaging', channelId);
      await channel.deleteMessage(messageId);
      
      // Send system message about deletion
      await channel.sendMessage({
        text: `⚠️ Message removed: ${reason}`,
        user_id: 'system',
        type: 'system',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  // Ban user for severe violations
  private async banUser(userId: string, reason: string): Promise<void> {
    try {
      await this.client.banUser(userId, {
        reason,
        timeout: 24 * 60 * 60, // 24 hours
      });
    } catch (error) {
      console.error('Error banning user:', error);
    }
  }

  // Report message for manual review
  private async reportMessage(
    channelId: string, 
    messageId: string, 
    moderationResult: ModerationResult
  ): Promise<void> {
    try {
      // Create report in Sanity
      const reportData = {
        reportedType: 'message',
        reportedRef: messageId,
        reason: `Auto-moderation: ${moderationResult.reason}`,
        reportedBy: 'system',
        timestamp: new Date().toISOString(),
        status: 'pending',
        adminNotes: `Severity: ${moderationResult.severity}\nConfidence: ${moderationResult.confidence}\nPatterns: ${moderationResult.patterns.join(', ')}`,
      };

      // You would typically save this to your Sanity database
      console.log('Auto-moderation report:', reportData);
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  }

  // Warn user about inappropriate content
  private async warnUser(
    channelId: string, 
    userId: string, 
    moderationResult: ModerationResult
  ): Promise<void> {
    try {
      const channel = this.client.channel('messaging', channelId);
      
      // Send warning message
      await channel.sendMessage({
        text: `⚠️ Warning: ${moderationResult.reason}. Please be respectful in this chat.`,
        user_id: 'system',
        type: 'system',
      });
    } catch (error) {
      console.error('Error warning user:', error);
    }
  }

  // Set up message moderation hooks
  async setupModerationHooks(): Promise<void> {
    // This would be called when initializing your Stream Chat client
    // to set up webhooks or event listeners for message moderation
    console.log('Stream Chat moderation hooks configured');
  }
}

// Utility function to create moderation instance
export function createStreamChatModeration(): StreamChatModeration {
  const apiKey = process.env.STREAM_API_KEY!;
  const apiSecret = process.env.STREAM_API_SECRET!;
  
  return new StreamChatModeration(apiKey, apiSecret);
} 