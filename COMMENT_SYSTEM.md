# Hybrid Comment System

A Reddit-style comment system with hybrid visibility - comments are visible to everyone, but only authenticated users can interact.

## Features

### 🔓 Public Access (Everyone)
- **View all comments** - No authentication required
- **Read comment content** - Full markdown support
- **See comment metadata** - Author, timestamps, likes/dislikes
- **Browse threaded replies** - Nested comment structure

### 🔐 Authenticated Users Only
- **Post new comments** - Create top-level comments
- **Reply to comments** - Create threaded replies
- **Like/dislike comments** - Vote on comments
- **Delete own comments** - Soft deletion (marks as deleted)
- **Edit own comments** - Modify comment content

## API Endpoints

### Public Endpoints (No Auth Required)

#### `GET /api/comments?startupId=POST_ID`
Returns all comments for a given startup post.

**Response:**
```json
{
  "comments": [
    {
      "_id": "comment_id",
      "text": "Comment content",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "_id": "user_id",
        "name": "User Name",
        "username": "username",
        "image": "avatar_url"
      },
      "likes": 5,
      "dislikes": 1,
      "deleted": false,
      "replies": [...]
    }
  ]
}
```

### Protected Endpoints (Auth Required)

#### `POST /api/comments`
Create a new comment or reply.

**Request Body:**
```json
{
  "text": "Comment content",
  "startupId": "startup_id",
  "action": "reply", // optional
  "parentId": "parent_comment_id" // required for replies
}
```

**Response:**
- `200` - Comment created successfully
- `401` - Unauthorized (not logged in)
- `400` - Missing required fields

#### `POST /api/comments/like`
Like or unlike a comment.

**Request Body:**
```json
{
  "commentId": "comment_id",
  "userId": "user_id"
}
```

#### `POST /api/comments/dislike`
Dislike or remove dislike from a comment.

**Request Body:**
```json
{
  "commentId": "comment_id",
  "userId": "user_id"
}
```

#### `PATCH /api/comments`
Edit a comment (author only).

**Request Body:**
```json
{
  "commentId": "comment_id",
  "text": "Updated comment content"
}
```

#### `DELETE /api/comments`
Delete a comment (author only, soft delete).

**Request Body:**
```json
{
  "commentId": "comment_id"
}
```

## Frontend Behavior

### For Logged-in Users
- ✅ **Comment input box** - Enabled with post button
- ✅ **Like/dislike buttons** - Functional with loading states
- ✅ **Reply buttons** - Can reply to any comment
- ✅ **Delete buttons** - Only on own comments
- ✅ **Edit functionality** - Only on own comments
- ✅ **Profile links** - Clickable avatars

### For Guest Users
- ❌ **Comment input box** - Hidden, replaced with login prompt
- ❌ **Like/dislike buttons** - Disabled with tooltips
- ❌ **Reply buttons** - Disabled with tooltips
- ❌ **Delete buttons** - Not visible
- ✅ **Profile links** - Still clickable
- ✅ **View all comments** - Full read access

### Login Prompt
When not logged in, users see:
```
┌─────────────────────────────────────┐
│ 🔓 Log in to comment                │
│                                     │
│ [Log In Button]                     │
└─────────────────────────────────────┘
```

## Component Structure

### `CommentsSection.tsx`
Main component that handles:
- Authentication state
- Comment fetching (public)
- Comment posting (authenticated)
- UI rendering for both user types

### `CommentCard.tsx` (internal)
Individual comment component with:
- Conditional rendering based on auth state
- Like/dislike functionality
- Reply system
- Delete/edit options

## Database Schema

### Comment Document
```typescript
{
  _id: string,
  _type: "comment",
  text: string,
  createdAt: string,
  author: Reference<User>,
  startup: Reference<Startup>,
  parent?: Reference<Comment>, // for replies
  replies: Reference<Comment>[],
  likes: number,
  dislikes: number,
  likedBy: string[], // user IDs
  dislikedBy: string[], // user IDs
  deleted: boolean // soft delete flag
}
```

## Security Features

### Authentication Checks
- All write operations require valid session
- User can only edit/delete their own comments
- Proper error handling with user-friendly messages

### Input Validation
- Comment length limits (1000 characters)
- Required field validation
- XSS protection via markdown sanitization

### Soft Deletion
- Comments are marked as deleted rather than removed
- Preserves thread structure
- Shows "[deleted]" text for deleted comments
- Hides action buttons on deleted comments

## Error Handling

### API Errors
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - Not authorized (wrong user)
- `404 Not Found` - Comment doesn't exist
- `400 Bad Request` - Missing/invalid data
- `500 Internal Server Error` - Server error

### User Feedback
- Toast notifications for success/error states
- Loading spinners for async operations
- Disabled states for unauthorized actions
- Clear error messages

## Testing

Run the test script to verify API endpoints:
```bash
node test-comments.js
```

This will test:
- Public GET endpoint accessibility
- Protected POST endpoints requiring auth
- Proper error responses

## Usage Example

```tsx
import CommentsSection from "@/components/CommentsSection";

function StartupPage({ startupId, session }) {
  return (
    <CommentsSection 
      startupId={startupId}
      isLoggedIn={!!session}
      userId={session?.id}
    />
  );
}
```

## Benefits

1. **SEO Friendly** - Comments visible to search engines
2. **User Engagement** - Guests can read content, encouraging signups
3. **Security** - Proper authentication for all write operations
4. **Scalability** - Modular design with separate endpoints
5. **User Experience** - Clear feedback and intuitive interface
6. **Maintainability** - Clean separation of concerns 