# 🐛 Troubleshooting Guide

This guide covers common issues you might encounter while developing, deploying, or using Foundrly, along with their solutions.

## 🚨 **Quick Fixes**

### **Application Won't Start**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json .next
npm install

# Check for port conflicts
npx kill-port 3000
npm run dev
```

### **Build Failures**
```bash
# Check TypeScript errors
npm run type-check

# Clear Next.js cache
rm -rf .next
npm run build
```

### **Database Connection Issues**
```bash
# Test Sanity connection
npx sanity debug

# Check environment variables
echo $NEXT_PUBLIC_SANITY_PROJECT_ID
echo $SANITY_API_TOKEN
```

## 🔧 **Development Issues**

### **Hot Reload Not Working**

#### **Problem**
Changes to files don't trigger automatic reloads in development.

#### **Solutions**
```bash
# 1. Check file watching limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 2. Restart development server
npm run dev

# 3. Clear Next.js cache
rm -rf .next
npm run dev
```

#### **Prevention**
- Use `npm run dev` instead of `yarn dev` if mixing package managers
- Ensure you're in the correct directory
- Check for file permission issues

### **TypeScript Errors**

#### **Problem**
TypeScript compilation errors preventing builds.

#### **Common Solutions**
```bash
# 1. Check TypeScript configuration
npx tsc --noEmit

# 2. Update type definitions
npm install @types/node @types/react @types/react-dom

# 3. Clear TypeScript cache
rm -rf tsconfig.tsbuildinfo
```

#### **Common Type Errors**
```typescript
// Fix: Add proper type annotations
const [data, setData] = useState<any>(null);

// Better:
interface User {
  id: string;
  name: string;
}
const [data, setData] = useState<User | null>(null);
```

### **Environment Variables Not Working**

#### **Problem**
Environment variables are undefined or not accessible.

#### **Solutions**
```bash
# 1. Check .env.local file exists
ls -la .env.local

# 2. Verify variable names
# Client-side variables must start with NEXT_PUBLIC_
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id

# 3. Restart development server
npm run dev
```

#### **Common Issues**
- **Client-side access**: Use `NEXT_PUBLIC_` prefix
- **Server-side only**: Don't use `NEXT_PUBLIC_` prefix
- **File location**: Place `.env.local` in project root

### **Docker Issues**

#### **Problem**
Docker containers won't start or have permission issues.

#### **Solutions**
```bash
# 1. Clean up Docker
docker-compose down -v
docker system prune -f

# 2. Rebuild from scratch
docker-compose -f docker-compose.dev.yml build --no-cache

# 3. Check Docker permissions
sudo usermod -aG docker $USER
# Log out and back in
```

#### **Common Docker Issues**
```bash
# Port already in use
npx kill-port 3000

# Permission denied
sudo chown -R $USER:$USER .

# Container won't start
docker logs foundrly-app-dev
```

## 🔐 **Authentication Issues**

### **NextAuth Not Working**

#### **Problem**
Users can't log in or sessions aren't maintained.

#### **Solutions**
```bash
# 1. Check environment variables
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL

# 2. Verify GitHub OAuth setup
# Check GitHub app settings at: https://github.com/settings/apps

# 3. Clear browser cookies and cache
```

#### **Common Issues**
- **Invalid callback URL**: Update GitHub OAuth app settings
- **Missing NEXTAUTH_SECRET**: Generate a secure secret
- **Wrong NEXTAUTH_URL**: Use correct domain (http://localhost:3000 for dev)

### **Session Management Issues**

#### **Problem**
Users are logged out unexpectedly or sessions don't persist.

#### **Solutions**
```typescript
// 1. Check session configuration in auth.ts
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ...
};
```

#### **Debug Session**
```typescript
// Add to any page to debug session
import { useSession } from "next-auth/react";

export default function DebugPage() {
  const { data: session, status } = useSession();
  console.log("Session:", session);
  console.log("Status:", status);
  return <div>Check console for session info</div>;
}
```

## 🗄️ **Database Issues**

### **Sanity Connection Problems**

#### **Problem**
Can't connect to Sanity CMS or queries fail.

#### **Solutions**
```bash
# 1. Test Sanity connection
npx sanity debug

# 2. Check project status
npx sanity projects list

# 3. Verify API token permissions
# Go to: https://www.sanity.io/manage
```

#### **Common Issues**
- **Invalid project ID**: Check `NEXT_PUBLIC_SANITY_PROJECT_ID`
- **Wrong dataset**: Verify `NEXT_PUBLIC_SANITY_DATASET`
- **Token permissions**: Ensure token has read/write access
- **Project suspended**: Check Sanity dashboard for billing issues

### **Query Performance Issues**

#### **Problem**
Database queries are slow or timing out.

#### **Solutions**
```typescript
// 1. Optimize GROQ queries
// Bad: Fetching all fields
const query = `*[_type == "startup"]`

// Good: Select only needed fields
const query = `*[_type == "startup"] {
  _id,
  title,
  description,
  "author": author->name
}`

// 2. Add pagination
const query = `*[_type == "startup"] | order(_createdAt desc) [0...10]`

// 3. Use indexes for frequently queried fields
// Add to schema: @index([fieldName])
```

### **Schema Migration Issues**

#### **Problem**
Database schema changes aren't reflected.

#### **Solutions**
```bash
# 1. Deploy schema changes
npx sanity deploy

# 2. Check schema files
npx sanity schema check

# 3. Validate schema
npx sanity validate
```

## 📤 **File Upload Issues**

### **Vercel Blob Problems**

#### **Problem**
File uploads fail or files aren't accessible.

#### **Solutions**
```bash
# 1. Check Vercel Blob configuration
echo $BLOB_READ_WRITE_TOKEN

# 2. Verify token permissions
# Go to Vercel dashboard → Storage → Blob

# 3. Test upload endpoint
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.jpg"
```

#### **Common Issues**
- **Token expired**: Generate new Vercel Blob token
- **File size limit**: Check Vercel Blob limits (100MB default)
- **File type restriction**: Verify allowed file types
- **CORS issues**: Check CORS configuration

### **Local File Storage Issues**

#### **Problem**
Files aren't saved locally in development.

#### **Solutions**
```bash
# 1. Check uploads directory
ls -la public/uploads/

# 2. Ensure directory exists
mkdir -p public/uploads

# 3. Check file permissions
chmod 755 public/uploads/
```

## 🔔 **Notification Issues**

### **Push Notifications Not Working**

#### **Problem**
Push notifications aren't being sent or received.

#### **Solutions**
```bash
# 1. Check VAPID keys
echo $VAPID_PUBLIC_KEY
echo $VAPID_PRIVATE_KEY

# 2. Verify service worker
# Check: public/sw.js exists and is registered

# 3. Test push subscription
# Use browser dev tools → Application → Service Workers
```

#### **Common Issues**
- **HTTPS required**: Push notifications need HTTPS in production
- **Service worker not registered**: Check registration in browser
- **Invalid VAPID keys**: Generate new keys
- **Browser permissions**: User must allow notifications

### **Email Notifications Failing**

#### **Problem**
Email notifications aren't being sent.

#### **Solutions**
```bash
# 1. Check SMTP configuration
echo $SMTP_HOST
echo $SMTP_USER
echo $SMTP_PASS

# 2. Test email sending
npm run test:email

# 3. Check email provider settings
# For Gmail: Enable "Less secure app access" or use App Password
```

#### **Common Issues**
- **SMTP authentication**: Use App Passwords for Gmail
- **Port blocked**: Try port 587 or 465
- **Rate limiting**: Check email provider limits
- **Spam filters**: Check email provider spam settings

## 🏆 **Badge System Issues**

### **Badges Not Awarding**

#### **Problem**
Users aren't receiving badges for their actions.

#### **Solutions**
```bash
# 1. Check badge system integration
# Verify badge checking is called in API routes

# 2. Test badge calculation
npm run badges:recalculate

# 3. Check badge criteria
# Verify badge criteria match user actions
```

#### **Debug Badge System**
```typescript
// Add to API routes to debug
import { badgeSystem } from '@/lib/badge-system';

// After user action
const newBadges = await badgeSystem.checkAndAwardBadges(
  userId, 
  'startup_created',
  { startupId: newStartup._id }
);
console.log('New badges:', newBadges);
```

### **Progress Not Updating**

#### **Problem**
Badge progress isn't updating in real-time.

#### **Solutions**
```typescript
// 1. Force progress recalculation
await badgeSystem.calculateProgress(userId);

// 2. Check real-time updates
// Verify Sanity real-time API is working

// 3. Refresh badge data
// Call badge API to get updated progress
```

## 🛡️ **Moderation Issues**

### **Reporting System Not Working**

#### **Problem**
Users can't submit reports or reports aren't processed.

#### **Solutions**
```bash
# 1. Check report API endpoint
curl -X POST http://localhost:3000/api/reports/submit \
  -H "Content-Type: application/json" \
  -d '{"type":"startup","targetId":"123","reason":"spam"}'

# 2. Verify moderation settings
# Check: /api/moderation/settings

# 3. Test ban application
# Use moderation dashboard to test bans
```

### **Ban System Issues**

#### **Problem**
User bans aren't working or users can still access the platform.

#### **Solutions**
```typescript
// 1. Check ban status in components
import { useBanStatus } from '@/hooks/use-ban-status';

// 2. Verify ban middleware
// Check: lib/ban-checks.ts

// 3. Test ban API
// Use: /api/user/[id]/ban-status
```

## 📊 **Performance Issues**

### **Slow Page Loads**

#### **Problem**
Pages take too long to load or feel sluggish.

#### **Solutions**
```typescript
// 1. Optimize images
import Image from 'next/image';

// 2. Add loading states
const [loading, setLoading] = useState(true);

// 3. Implement pagination
const [page, setPage] = useState(1);

// 4. Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

### **Memory Leaks**

#### **Problem**
Application memory usage increases over time.

#### **Solutions**
```typescript
// 1. Clean up event listeners
useEffect(() => {
  const handleResize = () => { /* ... */ };
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// 2. Clear intervals and timeouts
useEffect(() => {
  const interval = setInterval(() => { /* ... */ }, 1000);
  
  return () => {
    clearInterval(interval);
  };
}, []);
```

## 🌐 **Deployment Issues**

### **Vercel Deployment Failures**

#### **Problem**
Build fails on Vercel or deployment doesn't work.

#### **Solutions**
```bash
# 1. Check build logs in Vercel dashboard

# 2. Test build locally
npm run build

# 3. Verify environment variables
# Check all required variables are set in Vercel

# 4. Check Node.js version
# Ensure compatibility with Vercel's Node.js version
```

#### **Common Issues**
- **Missing environment variables**: Add all required variables
- **Build timeout**: Optimize build process
- **Memory limit**: Reduce bundle size
- **Node.js version**: Use compatible version

### **Docker Deployment Issues**

#### **Problem**
Docker containers fail to start or have issues.

#### **Solutions**
```bash
# 1. Check Docker logs
docker logs foundrly-app

# 2. Verify Docker configuration
docker-compose config

# 3. Check resource limits
# Ensure sufficient memory and CPU

# 4. Test locally first
docker-compose -f docker-compose.prod.yml up --build
```

## 🔍 **Debugging Tools**

### **Development Debugging**

#### **Browser Dev Tools**
```javascript
// Add to any component for debugging
console.log('Component rendered with props:', props);
console.log('State:', state);

// Debug API calls
console.log('API response:', response);
```

#### **Network Tab**
- Check API request/response
- Verify authentication headers
- Monitor file uploads
- Check for CORS errors

#### **React DevTools**
- Inspect component hierarchy
- Monitor state changes
- Profile performance
- Debug hooks

### **Server-Side Debugging**

#### **API Route Debugging**
```typescript
// Add to API routes
export async function GET(request: Request) {
  console.log('Request URL:', request.url);
  console.log('Request headers:', Object.fromEntries(request.headers));
  
  try {
    // Your logic here
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

#### **Database Debugging**
```typescript
// Debug Sanity queries
const query = `*[_type == "startup"]`;
console.log('Executing query:', query);

const result = await sanityClient.fetch(query);
console.log('Query result:', result);
```

### **Production Debugging**

#### **Sentry Integration**
```typescript
// Add error tracking
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

#### **Health Check Endpoint**
```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  };
  
  return Response.json(health);
}
```

## 📞 **Getting Help**

### **Before Asking for Help**

1. **Check this guide** for your specific issue
2. **Search existing issues** on GitHub
3. **Check browser console** for errors
4. **Verify environment setup** is correct
5. **Test with minimal reproduction** case

### **When Reporting Issues**

#### **Include the following:**
- **Error message** (exact text)
- **Steps to reproduce** the issue
- **Environment details** (OS, Node.js version, etc.)
- **Browser/device** information
- **Screenshots** if applicable
- **Console logs** and error stack traces

#### **Example Issue Report:**
```
**Issue**: Authentication not working in production

**Environment**:
- OS: macOS 12.0
- Node.js: 18.0.0
- Browser: Chrome 100.0
- Deployment: Vercel

**Steps to reproduce**:
1. Deploy to Vercel
2. Try to log in with GitHub
3. Get redirected to error page

**Error message**:
"Invalid callback URL"

**Console logs**:
[Error] OAuth callback failed: Invalid callback URL

**Expected behavior**:
User should be able to log in successfully
```

### **Community Resources**

- **GitHub Issues**: [Report bugs](https://github.com/yourusername/foundrly/issues)
- **Discord**: [Join community](https://discord.gg/foundrly)
- **Documentation**: [Read docs](./README.md)
- **Stack Overflow**: [Search existing questions](https://stackoverflow.com/questions/tagged/foundrly)

---

**Still having issues?** Open a detailed issue on GitHub with all the information above.
