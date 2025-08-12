# 📧 Email Notification System Setup

## 🔧 **Environment Variables Required**

Add these to your `.env.local` file:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📱 **Gmail Setup (Recommended)**

### **1. Enable 2-Factor Authentication**
- Go to [Google Account Settings](https://myaccount.google.com/)
- Enable 2-Step Verification

### **2. Generate App Password**
- Go to [App Passwords](https://myaccount.google.com/apppasswords)
- Select "Mail" and "Other (Custom name)"
- Name it "Foundrly Notifications"
- Copy the generated 16-character password

### **3. Use App Password**
- Set `SMTP_PASS` to the generated app password (not your regular password)

## 🚀 **Alternative Email Providers**

### **SendGrid**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### **Mailgun**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### **AWS SES**
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## 🧪 **Testing the System**

### **1. Test Basic Email**
- Go to `/test-notifications`
- Click "Test Basic Email"
- Enter your email address
- Check your inbox

### **2. Test Specific Templates**
- Test each email type:
  - Account Suspended
  - Content Removed
  - Security Alert
  - Startup Verified
  - Report Resolved

### **3. Test with Real Notifications**
- Create a test "action against you" notification
- It should automatically send an email
- Check both the notification and your email

## 📧 **Email Templates Available**

### **Critical Notifications**
- **Account Suspended** - For serious violations
- **Content Removed** - For guideline violations
- **Security Alert** - For unusual activity

### **Positive Notifications**
- **Startup Verified** - For successful verifications
- **Report Resolved** - For resolved user reports

## 🔄 **Automatic Email Sending**

The system automatically sends emails for:
- `report` type notifications with `actionTaken` metadata
- `system` type notifications (when implemented)
- Critical moderation actions

## 🛠️ **Customization**

### **Modify Email Templates**
Edit `lib/email.ts` to customize:
- Email subjects
- HTML templates
- Styling and branding
- Call-to-action buttons

### **Add New Templates**
1. Add new template to `emailTemplates`
2. Add corresponding method to `EmailNotificationService`
3. Update the notification logic to trigger emails

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Authentication failed"**
   - Check your SMTP credentials
   - Ensure 2FA is enabled for Gmail
   - Use app password, not regular password

2. **"Connection timeout"**
   - Check firewall settings
   - Verify SMTP host and port
   - Try different SMTP providers

3. **"Email not received"**
   - Check spam folder
   - Verify email address
   - Check SMTP logs in console

### **Debug Mode**
Check the browser console and server logs for detailed error information.

## 📊 **Monitoring**

- Email sending is logged to console
- Failed emails don't break notification creation
- Check logs for email delivery status

## 🔒 **Security Notes**

- Never commit email credentials to git
- Use environment variables for all sensitive data
- Consider rate limiting for production
- Monitor email sending for abuse prevention 