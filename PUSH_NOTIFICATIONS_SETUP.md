# Push Notifications Setup Guide

## Overview
This guide will help you set up browser push notifications for your Foundrly application. Push notifications allow users to receive real-time updates even when the app is closed.

## Prerequisites
- Node.js 18+ installed
- A web browser that supports Service Workers and Push API
- HTTPS enabled (required for production)

## 1. Install Dependencies

```bash
npm install web-push
npm install --save-dev @types/web-push
```

## 2. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for push notifications to work.

### Option A: Generate using web-push CLI
```bash
npx web-push generate-vapid-keys
```

### Option B: Generate programmatically
```javascript
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

## 3. Environment Variables

Add these to your `.env.local` file:

```env
# VAPID Keys (required for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=noreply@yourdomain.com

# Optional: Custom SMTP for email fallback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 4. Deploy Sanity Schema

The push notification system requires a new Sanity schema. Deploy it using:

```bash
npm run sanity:deploy
```

Or manually in Sanity Studio:
1. Go to your Sanity Studio
2. Navigate to Schema Types
3. Add the `pushSubscription` schema
4. Publish the changes

## 5. Service Worker

The service worker (`public/sw.js`) is automatically created and handles:
- Push notification events
- Notification clicks
- Background sync
- Offline caching

## 6. Testing Push Notifications

### Test Page
Visit `/test-push-notifications` to:
- Configure push notification settings
- Test notification delivery
- Verify subscription status

### Manual Testing
1. Enable push notifications in your browser
2. Subscribe to notifications using the settings component
3. Create a test notification
4. Verify the push notification appears

## 7. Browser Support

### Supported Browsers
- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Safari 16+
- ✅ Edge 17+

### Mobile Support
- ✅ Chrome for Android
- ✅ Firefox for Android
- ✅ Safari for iOS 16.4+

## 8. Troubleshooting

### Common Issues

#### "Push notifications not supported"
- Ensure you're using HTTPS (required for production)
- Check browser compatibility
- Verify Service Worker registration

#### "Permission denied"
- User must manually enable notifications in browser settings
- Check browser notification permissions
- Clear browser cache and try again

#### "Service Worker not registered"
- Verify `public/sw.js` exists
- Check browser console for errors
- Ensure HTTPS is enabled

#### "VAPID keys invalid"
- Verify environment variables are set correctly
- Check key format (should be base64)
- Regenerate VAPID keys if needed

### Debug Steps
1. Check browser console for errors
2. Verify Service Worker is active
3. Check notification permissions
4. Test with browser dev tools
5. Verify VAPID keys are loaded

## 9. Production Deployment

### Vercel
1. Add environment variables in Vercel dashboard
2. Ensure `public/sw.js` is included in build
3. Verify HTTPS is enabled

### Other Platforms
1. Set environment variables
2. Include service worker in public directory
3. Enable HTTPS
4. Test push notification delivery

## 10. Security Considerations

### VAPID Keys
- Keep private key secure
- Never expose private key in client code
- Rotate keys periodically

### User Privacy
- Only send notifications to subscribed users
- Respect user preferences
- Provide easy unsubscribe options

### Rate Limiting
- Implement notification rate limiting
- Avoid spam notifications
- Monitor notification delivery

## 11. Monitoring and Analytics

### Track Notification Metrics
- Delivery success rate
- Click-through rates
- User engagement
- Error rates

### Logging
- Log notification attempts
- Track permission changes
- Monitor subscription status

## 12. Advanced Features

### Rich Notifications
- Custom icons and badges
- Action buttons
- Rich media content
- Silent notifications

### Background Sync
- Offline notification queuing
- Automatic retry mechanisms
- Sync when online

### Notification Actions
- Custom action buttons
- Deep linking
- User interaction tracking

## 13. Best Practices

### User Experience
- Request permission at appropriate times
- Provide clear value proposition
- Allow easy opt-out
- Test on multiple devices

### Performance
- Minimize service worker size
- Efficient caching strategies
- Background processing
- Memory management

### Accessibility
- Screen reader support
- High contrast notifications
- Keyboard navigation
- Alternative notification methods

## 14. Support

### Resources
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

### Testing Tools
- Chrome DevTools
- Firefox Developer Tools
- Safari Web Inspector
- Browser notification testers

## 15. Maintenance

### Regular Tasks
- Monitor notification delivery
- Update VAPID keys
- Review user feedback
- Performance optimization
- Security updates

### Updates
- Keep dependencies updated
- Monitor browser changes
- Test new features
- User communication

---

**Note**: Push notifications require user consent and may be blocked by browser settings or ad blockers. Always provide alternative notification methods for critical updates. 