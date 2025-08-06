# Stream Chat Webhook Setup for Auto-Moderation

## Overview
This guide explains how to set up Stream Chat webhooks to enable real-time auto-moderation of chat messages.

## Webhook Endpoint
- **URL**: `https://yourdomain.com/api/chat/moderation`
- **Method**: POST
- **Content-Type**: application/json

## Setup Instructions

### 1. Stream Chat Dashboard Configuration

1. **Login to Stream Chat Dashboard**
   - Go to https://dashboard.getstream.io/
   - Navigate to your app

2. **Configure Webhook**
   - Go to **Settings** → **Webhooks**
   - Click **Add Webhook**
   - Fill in the following details:
     - **URL**: `https://yourdomain.com/api/chat/moderation`
     - **Events**: Select `message.new`
     - **Enabled**: ✅ Check this box

3. **Security Settings**
   - **Signature Verification**: Enable
   - **Secret Key**: Generate a secure secret key
   - **Timeout**: Set to 10 seconds

### 2. Environment Variables

Add these to your `.env.local`:

```env
# Stream Chat Configuration
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
STREAM_WEBHOOK_SECRET=your_webhook_secret_key
```

### 3. Webhook Events Handled

The webhook endpoint processes the following events:

- **`message.new`**: New messages sent in channels
- **Auto-moderation**: Content analysis and filtering
- **User bans**: Automatic user suspension
- **Message deletion**: Removal of inappropriate content
- **Warning messages**: System warnings to users

## Moderation Actions

### 1. Content Detection
- **Profanity**: Offensive language detection
- **Hate Speech**: Discriminatory content
- **Threats**: Violent or threatening language
- **Spam**: Unwanted promotional content
- **Personal Info**: Private data protection

### 2. Severity Levels
- **Low**: Warnings only
- **Medium**: Message deletion + warnings
- **High**: User bans + message deletion
- **Critical**: Permanent bans

### 3. Strike System Integration
- **1st Strike**: Temporary ban (24h)
- **2nd Strike**: Temporary ban (24h)
- **3rd Strike**: Automatic permanent ban

## Testing the Webhook

### 1. Test Message
Send a test message with inappropriate content:

```json
{
  "type": "message.new",
  "channel_id": "test-channel",
  "user_id": "test-user",
  "message": {
    "id": "test-message-id",
    "text": "This is a test message with inappropriate content"
  }
}
```

### 2. Expected Response
```json
{
  "success": true,
  "moderationResult": {
    "isFlagged": true,
    "severity": "medium",
    "action": "delete",
    "reason": "Inappropriate language detected",
    "patterns": ["profanity"],
    "confidence": 0.8
  },
  "action": "delete"
}
```

## Monitoring and Logs

### 1. Webhook Logs
Check your application logs for:
- Message moderation events
- User ban actions
- Report creation
- Error messages

### 2. Sanity Studio
Monitor auto-generated reports in Sanity Studio:
- Go to **Reports & Moderation**
- Look for reports with "Auto-moderation" in the reason
- Review and take manual action if needed

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Verify webhook URL is accessible
   - Check Stream Chat dashboard configuration
   - Ensure webhook is enabled

2. **Signature Verification Failed**
   - Verify `STREAM_WEBHOOK_SECRET` environment variable
   - Check webhook secret in Stream Chat dashboard

3. **User Not Found**
   - Ensure user exists in Sanity database
   - Check user ID mapping between Stream Chat and Sanity

4. **Ban Not Applied**
   - Verify Sanity write permissions
   - Check ban history structure
   - Review strike system calculations

### Debug Mode

Enable debug logging by adding to your webhook endpoint:

```typescript
console.log('Webhook received:', JSON.stringify(body, null, 2))
```

## Security Considerations

### 1. Webhook Security
- Always verify webhook signatures
- Use HTTPS for webhook URLs
- Implement rate limiting
- Monitor for abuse

### 2. Data Privacy
- Don't log sensitive message content
- Implement data retention policies
- Follow GDPR compliance guidelines

### 3. Access Control
- Restrict webhook access to Stream Chat only
- Monitor webhook usage patterns
- Implement IP whitelisting if possible

## Performance Optimization

### 1. Response Time
- Keep webhook responses under 5 seconds
- Implement async processing for heavy operations
- Use connection pooling for database operations

### 2. Error Handling
- Implement retry logic for failed operations
- Log errors for debugging
- Graceful degradation for service failures

## Advanced Configuration

### 1. Custom Moderation Rules
Edit `lib/stream-chat-moderation.ts` to:
- Add custom pattern matching
- Adjust severity thresholds
- Modify action triggers

### 2. Integration with External Services
- Connect to external moderation APIs
- Implement machine learning models
- Add image moderation capabilities

### 3. Analytics and Reporting
- Track moderation effectiveness
- Monitor false positive rates
- Generate moderation reports

## Support

For issues with Stream Chat webhooks:
- Check Stream Chat documentation
- Review webhook logs
- Contact Stream Chat support

For issues with auto-moderation:
- Check application logs
- Review Sanity Studio reports
- Verify environment variables 