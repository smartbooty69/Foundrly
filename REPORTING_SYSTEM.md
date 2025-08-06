# Reporting and Moderation System

## Overview
This system allows users to report content (startups, comments, users) and provides admin moderation through Sanity Studio.

## Schema Structure

### Report Schema (`sanity/schemaTypes/report.ts`)
- `reportedType`: "startup" | "comment" | "user"
- `reportedRef`: Reference to the reported item
- `reason`: Report reason (10-1000 chars)
- `reportedBy`: Reference to user who reported
- `timestamp`: When report was submitted
- `status`: "pending" | "reviewed" | "action-taken"
- `banDuration`: Ban duration (1h, 24h, 7d, 365d, perm)
- `adminNotes`: Admin notes about the report
- `deleteComment`: Boolean to delete reported comment (comment reports only)

### Ban Fields (Added to existing schemas)
- `bannedUntil`: datetime - When ban expires (null if permanent)
- `isBanned`: boolean - Whether currently banned

## Sanity Studio Features

### Reports & Moderation Section
- **Pending Reports**: Filtered list of reports with status "pending"
- **All Reports**: Complete list of all reports
- **Admin Actions**: Direct editing of ban duration, admin notes, and delete comment option

### Custom Input Component
- `ReportActionInput.tsx`: Enhanced UI for admin actions
- Apply/remove bans directly to reported items
- Update report status and add notes

## API Endpoints

### Report Submission
- `POST /api/reports/submit`: Submit new reports
- Authentication required
- Validates reported item exists
- Creates report in Sanity

## Frontend Components

### ReportModal
- Clean modal for report submission
- Form validation (10+ characters)
- Character counter
- Success/error notifications

### Integration Points
- **CommentsSection**: Report button for comments
- **StartupCard**: Report button for startups (removed per user request)

## Utility Functions (`sanity/lib/moderation.ts`)

### Ban Management
```typescript
export const BAN_DURATIONS = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '365d': 365 * 24 * 60 * 60 * 1000,
  'perm': null,
}

export function calculateBanEndDate(duration: BanDuration): Date | null
export function isBanExpired(bannedUntil: string | null): boolean
export function isCurrentlyBanned(bannedUntil: string | null, isBanned: boolean): boolean
export function getBanStatusDescription(bannedUntil: string | null, isBanned: boolean): string
```

## Ban Durations
- **1 Hour**: Short-term cooling off
- **24 Hours**: Day-long suspension
- **7 Days**: Week-long suspension
- **365 Days**: Year-long suspension
- **Permanently**: Permanent ban

## Usage Examples

### Check Ban Status in Code
```typescript
import { isCurrentlyBanned } from '@/sanity/lib/moderation'

// In your component
const isBanned = isCurrentlyBanned(user.bannedUntil, user.isBanned)
if (isBanned) {
  // Show ban message or restrict actions
}
```

### Manual Report Creation in Sanity Studio
1. Go to "🚨 Reports & Moderation" → "All Reports"
2. Click "Create new"
3. Fill in:
   - Reported Type: "comment"
   - Reported Ref: [comment ID]
   - Reason: [report reason]
   - Reported By: [user reference]
4. Save the report

## Admin Workflow

### Reviewing Reports
1. Open Sanity Studio
2. Navigate to "🚨 Reports & Moderation"
3. Click "Pending Reports" to see unreviewed reports
4. Open a report to review details
5. Take action:
   - Set ban duration if needed
   - Add admin notes
   - Check "Delete Comment" for comment reports
   - Update status to "action-taken"

### Applying Bans
- Bans are applied automatically when admin sets ban duration
- Ban affects the reported user/startup/comment
- Ban duration is calculated from current time
- Permanent bans have `bannedUntil: null`

## 3-Strike System

The moderation system implements a progressive 3-strike system:

### Strike Progression
- **1st Strike**: Temporary ban (1h, 24h, 7d, 365d)
- **2nd Strike**: Temporary ban (1h, 24h, 7d, 365d)  
- **3rd Strike**: **Automatic Permanent Ban**

### Strike System Features
- **Automatic Escalation**: 3rd violation automatically becomes permanent
- **Ban History Tracking**: Complete history of all bans and strikes
- **Strike Count**: Current number of active strikes (0-3)
- **Visual Indicators**: Color-coded badges and warnings in Sanity Studio

### Strike System Schema Fields
- `strikeCount`: Current number of strikes (0-3)
- `banHistory`: Array of all ban entries with timestamps, reasons, and strike numbers
- `strikeSystem`: Custom input component for managing strikes in Sanity Studio

### API Endpoints
- `POST /api/reports/apply-ban`: Applies bans using the strike system
- Automatically calculates appropriate ban duration based on strike count
- Updates ban history and strike count

### Utility Functions (`sanity/lib/strike-system.ts`)
```typescript
export function calculateStrikeBan(currentStrikeCount: number, requestedDuration: string): StrikeSystemResult
export function createBanHistoryEntry(duration: string, reason: string, reportId?: string, strikeNumber?: number): BanHistoryEntry
export function getCurrentStrikeCount(banHistory: BanHistoryEntry[]): number
export function getBanSummary(isBanned: boolean, bannedUntil: string | null, strikeCount: number, banHistory: BanHistoryEntry[]): BanSummary
```

## Ban Restrictions

When a user is banned, the following actions should be restricted:

### Content Creation
- ❌ **Create new startups**
- ❌ **Post comments**
- ❌ **Reply to comments**
- ❌ **Upload images/files**

### Social Interactions
- ❌ **Like/dislike content**
- ❌ **Follow other users**
- ❌ **Send direct messages**
- ❌ **Create new chat channels**
- ❌ **Report content**

### Profile Actions
- ❌ **Edit profile**
- ❌ **Change avatar**
- ❌ **Update bio**

### Viewing Restrictions
- ✅ **View content** (read-only access)
- ✅ **Browse startups**
- ✅ **View user profiles**
- ❌ **Access premium features**

### Implementation Strategy

#### Frontend Checks
```typescript
// In components that allow user actions
const isBanned = isCurrentlyBanned(user.bannedUntil, user.isBanned)

if (isBanned) {
  return <BanMessage duration={getBanStatusDescription(user.bannedUntil, user.isBanned)} />
}

// Or disable buttons
<Button disabled={isBanned} onClick={handleAction}>
  {isBanned ? 'Banned' : 'Action'}
</Button>
```

#### Chat API Protection
```typescript
// In chat API routes
const user = await client.fetch(
  `*[_type == "author" && _id == $userId][0]{ _id, bannedUntil, isBanned }`,
  { userId }
);

if (user?.isBanned) {
  const isCurrentlyBanned = isCurrentlyBanned(user.bannedUntil, user.isBanned);
  if (isCurrentlyBanned) {
    return NextResponse.json({
      error: 'Account is suspended. You cannot send messages.',
      details: 'Your account has been suspended due to a violation of our community guidelines.'
    }, { status: 403 });
  }
}
```

#### API Route Protection
```typescript
// In API routes
const user = await getUser(session.user.email)
if (isCurrentlyBanned(user.bannedUntil, user.isBanned)) {
  return NextResponse.json({ error: 'Account is banned' }, { status: 403 })
}
```

#### Database Queries
```typescript
// Filter out banned users from queries
const activeUsers = await client.fetch(`
  *[_type == "author" && (!isBanned || isBanned == false)]
`)
```

### Ban Status Display
- Show ban duration to banned users
- Display "Account suspended until [date]" message
- Provide contact information for appeals
- Clear indication of when ban expires

### Ban Recovery
- Automatic unban when `bannedUntil` expires
- Manual unban through admin interface
- Ban history tracking for repeat offenders

## Security Considerations

### Data Protection
- Ban status should be checked on both client and server
- API routes must validate ban status before allowing actions
- Frontend should gracefully handle banned user states

### Admin Access
- Only authenticated admins can modify ban status
- All ban actions are logged in report documents
- Audit trail for all moderation decisions

### User Experience
- Clear messaging about why actions are restricted
- Informative ban status messages
- Graceful degradation for banned users

## Future Enhancements

### Advanced Moderation
- **Warning System**: Pre-ban warnings for minor violations
- **Appeal Process**: Allow users to appeal bans
- **Graduated Bans**: Increasing ban durations for repeat violations
- **Content Moderation**: AI-powered content filtering

### Analytics
- **Report Analytics**: Track common violation types
- **Ban Effectiveness**: Measure impact of bans on behavior
- **Moderation Metrics**: Admin performance tracking

### User Communication
- **Ban Notifications**: Email notifications for bans
- **Appeal System**: Structured appeal process
- **Ban History**: User-visible ban history

## Auto Moderation for Stream Chat

The system includes comprehensive auto-moderation for Stream Chat messages to automatically detect and handle inappropriate content.

### Auto Moderation Features

#### Content Detection
- **Profanity Filtering**: Detects and handles offensive language
- **Hate Speech Detection**: Identifies discriminatory content
- **Threat Detection**: Flags violent or threatening language
- **Spam Prevention**: Blocks unwanted promotional content
- **Personal Information Protection**: Prevents sharing of private data

#### Moderation Actions
- **Warn**: Send warning message to user
- **Delete**: Remove inappropriate message
- **Ban**: Temporarily ban user from chat
- **Report**: Create report for manual review

#### Severity Levels
- **Low**: Minimal intervention, warnings only
- **Medium**: Balanced approach, delete inappropriate content
- **High**: Aggressive filtering, ban users for violations
- **Critical**: Maximum protection, immediate bans for severe violations

### Implementation

#### Moderation Library (`lib/stream-chat-moderation.ts`)
```typescript
// Content moderation function
export function moderateContent(text: string): ModerationResult

// Auto moderation handler
export class StreamChatModeration {
  async handleMessageModeration(channelId, messageId, userId, text)
  private async deleteMessage(channelId, messageId, reason)
  private async banUser(userId, reason)
  private async reportMessage(channelId, messageId, moderationResult)
  private async warnUser(channelId, userId, moderationResult)
}
```

#### API Endpoint (`app/api/chat/moderation/route.ts`)
- Handles Stream Chat webhook events
- Processes new messages for moderation
- Creates auto-moderation reports in Sanity
- Applies appropriate actions based on content

#### Frontend Integration
- **Pre-send Validation**: Check content before sending messages
- **User Warnings**: Show alerts for flagged content
- **Admin Settings**: Configure moderation rules and thresholds

### Moderation Patterns

#### Inappropriate Content Detection
```typescript
const INAPPROPRIATE_PATTERNS = {
  profanity: [/\b(fuck|shit|bitch|...)\b/gi],
  hateSpeech: [/\b(nigger|faggot|...)\b/gi],
  threats: [/\b(kill|murder|...)\b/gi],
  spam: [/\b(buy now|click here|...)\b/gi],
  personalInfo: [/\d{3}-\d{3}-\d{4}/g, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g],
};
```

#### Behavioral Analysis
- **Message Length**: Flag very long messages (>500 chars)
- **Repetition Detection**: Identify excessive word repetition
- **Caps Detection**: Flag excessive capitalization (>70%)
- **Pattern Matching**: Regex-based content filtering

### Configuration

#### Moderation Settings Component
- **Enable/Disable**: Toggle auto-moderation on/off
- **Severity Levels**: Configure moderation strictness
- **Action Settings**: Set actions for different content types
- **Threshold Configuration**: Adjust detection sensitivity

#### Admin Controls
- **Real-time Monitoring**: View moderation activity
- **Custom Rules**: Add custom detection patterns
- **Action Override**: Manually override auto-moderation decisions
- **Analytics**: Track moderation effectiveness

### Integration with Existing System

#### Report Generation
- Auto-moderation triggers create reports in Sanity
- Reports include severity, confidence, and detected patterns
- Integration with existing 3-strike system
- Admin review and manual action capabilities

#### Ban System Integration
- Auto-moderation can trigger user bans
- Bans integrate with existing ban restrictions
- Strike system progression for repeated violations
- Automatic ban expiration and recovery

### Security Considerations

#### Content Privacy
- Message content is processed locally when possible
- Sensitive data is not logged or stored
- Moderation decisions are logged for audit purposes

#### Performance Optimization
- Efficient regex pattern matching
- Caching of moderation results
- Asynchronous processing for real-time chat

#### False Positive Mitigation
- Confidence scoring for moderation decisions
- Multiple pattern matching for accuracy
- Admin override capabilities for edge cases 