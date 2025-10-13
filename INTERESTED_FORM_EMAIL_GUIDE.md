# Interested Form Email Notification Guide

This guide explains how the email notification system works when someone submits the interested form.

## Overview

When a user submits the interested form for a startup, an email notification is automatically sent to the startup owner with all the form data. The system respects the owner's email preferences.

## How It Works

1. **Form Submission**: User fills out the interested form in `InterestedModal.tsx`
2. **API Processing**: Form data is sent to `/api/interested-form` endpoint
3. **Data Validation**: The system validates the form data and checks startup ownership
4. **Database Storage**: Form data is saved to Sanity as an `interestedSubmission` document
5. **Email Notification**: An email is sent to the startup owner with all form details
6. **Preference Check**: The system respects the owner's email notification preferences

## Email Content

The email includes:
- **Header**: Startup title and interested person's name
- **Contact Information**: Name, email, phone, company, role, preferred contact method
- **Investment Details**: Amount, type, timeline (if provided)
- **Message**: The interested person's message
- **Additional Links**: LinkedIn, website (if provided)
- **Call-to-Action**: Link to view all interested users

## Configuration

### Environment Variables Required

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Email Preferences

Users can control email notifications in their account settings:
- Enable/disable all email notifications
- Control specific notification types (including "interested" notifications)

## Testing

### Test Email Configuration

```bash
# Test if email is properly configured
curl http://localhost:3000/api/test-email
```

### Test Interested Form Email

```bash
# Send a test interested form email
curl -X POST http://localhost:3000/api/test-interested-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "startup-owner@example.com",
    "startupOwnerName": "John Doe",
    "startupTitle": "Amazing Startup",
    "interestedUserName": "Jane Smith"
  }'
```

### Test General Email

```bash
# Send a general test email
curl -X POST http://localhost:3000/api/debug-send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com"
  }'
```

## Files Involved

- **Form Component**: `components/InterestedModal.tsx`
- **API Endpoint**: `app/api/interested-form/route.ts`
- **Email Function**: `lib/emailNotifications.ts` - `sendInterestedSubmissionEmail()`
- **Database Schema**: `sanity/schemaTypes/interestedSubmission.ts`
- **Test Endpoints**: 
  - `app/api/test-email/route.ts`
  - `app/api/test-interested-email/route.ts`
  - `app/api/debug-send-email/route.ts`

## Troubleshooting

### Email Not Sending

1. **Check Environment Variables**: Ensure `SMTP_USER` and `SMTP_PASS` are set
2. **Check Email Preferences**: Verify the startup owner has email notifications enabled
3. **Check Logs**: Look for error messages in the console
4. **Test Configuration**: Use the test endpoints to verify email setup

### Common Issues

- **"Email not configured"**: Missing SMTP environment variables
- **"Email skipped by preferences"**: Owner has disabled email notifications
- **"Failed to send email"**: SMTP authentication or connection issues

### Debug Steps

1. Test email configuration: `GET /api/test-email`
2. Test general email: `POST /api/debug-send-email`
3. Test interested form email: `POST /api/test-interested-email`
4. Check browser console for errors during form submission
5. Check server logs for email sending errors

## Security

- Test endpoints are protected in production (require admin secret)
- Email addresses are validated before sending
- User preferences are respected
- No sensitive data is logged in plain text

## Email Template

The email uses a responsive HTML template with:
- Professional styling
- Clear information hierarchy
- Mobile-friendly design
- Call-to-action buttons
- Footer with timestamp and preference management info
