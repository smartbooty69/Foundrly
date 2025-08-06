# API Enhancements for Reporting & Moderation System

This document outlines the new API endpoints implemented for enhanced ban status checking, ban history management, and moderation settings.

## 📋 **Table of Contents**

1. [Ban Status Checking Endpoints](#ban-status-checking-endpoints)
2. [Ban History Endpoints](#ban-history-endpoints)
3. [Moderation Settings API](#moderation-settings-api)
4. [Error Codes](#error-codes)
5. [Usage Examples](#usage-examples)

---

## 🔍 **Ban Status Checking Endpoints**

### 1. Individual Ban Status Check
**Endpoint:** `GET /api/user/[id]/ban-status`  
**Description:** Check ban status for a single user  
**Authentication:** Not required  
**Rate Limit:** 100 requests per minute

**Response:**
```json
{
  "isBanned": true,
  "banReason": "Account suspended due to violation of community guidelines",
  "banEndDate": "2024-01-15T10:30:00.000Z",
  "isPermanent": false,
  "message": "Your account is suspended for 2 more days. You cannot perform this action."
}
```

### 2. Batch Ban Status Check
**Endpoint:** `POST /api/user/batch-ban-status`  
**Description:** Check ban status for multiple users at once  
**Authentication:** Not required  
**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "userIds": ["user1", "user2", "user3"]
}
```

**Response:**
```json
{
  "results": [
    {
      "userId": "user1",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "isBanned": true,
      "banEndDate": "2024-01-15T10:30:00.000Z",
      "isPermanent": false,
      "strikeCount": 2,
      "canPerformActions": false
    }
  ],
  "summary": {
    "total": 3,
    "found": 2,
    "notFound": 1,
    "banned": 1,
    "active": 1
  }
}
```

### 3. Strike Count Check
**Endpoint:** `POST /api/user/strike-count`  
**Description:** Get strike counts and next action for multiple users  
**Authentication:** Not required  
**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "userIds": ["user1", "user2", "user3"]
}
```

**Response:**
```json
{
  "results": [
    {
      "userId": "user1",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "strikeCount": 2,
      "isBanned": true,
      "bannedUntil": "2024-01-15T10:30:00.000Z",
      "nextStrikeAction": "Third strike: Permanent ban"
    }
  ],
  "summary": {
    "total": 3,
    "found": 2,
    "notFound": 1,
    "averageStrikes": 1.5,
    "usersWithStrikes": 2
  }
}
```

---

## 📚 **Ban History Endpoints**

### 1. User Ban History
**Endpoint:** `GET /api/user/[id]/ban-history`  
**Description:** Get complete ban history for a specific user  
**Authentication:** Not required  
**Rate Limit:** 50 requests per minute

**Response:**
```json
{
  "userId": "user1",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "currentBanStatus": {
    "isBanned": true,
    "bannedUntil": "2024-01-15T10:30:00.000Z"
  },
  "banHistory": [
    {
      "reason": "Violation of community guidelines",
      "bannedUntil": "2024-01-15T10:30:00.000Z",
      "bannedAt": "2024-01-10T10:30:00.000Z",
      "bannedBy": "admin@example.com",
      "isPermanent": false,
      "strikeCount": 2
    }
  ]
}
```

### 2. Comprehensive Ban History
**Endpoint:** `GET /api/moderation/ban-history`  
**Description:** Get paginated ban history with search and filtering  
**Authentication:** Not required  
**Rate Limit:** 20 requests per minute

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search by name or email
- `status` (string): Filter by status ('active', 'expired', 'permanent')
- `startDate` (string): Start date for filtering (ISO format)
- `endDate` (string): End date for filtering (ISO format)

**Response:**
```json
{
  "results": [
    {
      "userId": "user1",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "currentStatus": {
        "isBanned": true,
        "bannedUntil": "2024-01-15T10:30:00.000Z",
        "isPermanent": false
      },
      "strikeCount": 2,
      "totalBans": 3,
      "latestBan": {
        "reason": "Violation of community guidelines",
        "bannedAt": "2024-01-10T10:30:00.000Z",
        "bannedBy": "admin@example.com",
        "isPermanent": false,
        "strikeCount": 2
      },
      "banHistory": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "search": "john",
    "status": "active",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

### 3. Ban History Export
**Endpoint:** `GET /api/moderation/ban-history/export`  
**Description:** Export ban history as CSV file  
**Authentication:** Required  
**Rate Limit:** 5 requests per minute

**Query Parameters:** Same as comprehensive ban history

**Response:** CSV file download

### 4. Ban History Analytics
**Endpoint:** `GET /api/moderation/ban-history/analytics`  
**Description:** Get analytics data for ban history  
**Authentication:** Not required  
**Rate Limit:** 10 requests per minute

**Query Parameters:**
- `period` (string): Time period ('7d', '30d', '90d', '1y', 'all')
- `startDate` (string): Custom start date (ISO format)
- `endDate` (string): Custom end date (ISO format)

**Response:**
```json
{
  "period": "30d",
  "dateRange": {
    "start": "2023-12-15T00:00:00.000Z",
    "end": "2024-01-15T00:00:00.000Z"
  },
  "analytics": {
    "overview": {
      "totalUsers": 45,
      "currentlyBanned": 12,
      "permanentlyBanned": 3,
      "temporarilyBanned": 9,
      "totalBans": 67,
      "averageStrikes": 1.8
    },
    "banReasons": [
      { "reason": "Violation of community guidelines", "count": 25 },
      { "reason": "Spam", "count": 15 },
      { "reason": "Hate speech", "count": 12 }
    ],
    "dailyTrends": [
      { "date": "2024-01-10", "count": 3 },
      { "date": "2024-01-11", "count": 1 }
    ],
    "durationStats": {
      "averageHours": 168.5,
      "totalBansWithDuration": 45,
      "shortestBan": 24,
      "longestBan": 720
    },
    "strikeDistribution": {
      "zeroStrikes": 20,
      "oneStrike": 15,
      "twoStrikes": 8,
      "threePlusStrikes": 2
    }
  }
}
```

---

## ⚙️ **Moderation Settings API**

### 1. Get Moderation Settings
**Endpoint:** `GET /api/moderation/settings`  
**Description:** Retrieve current moderation settings  
**Authentication:** Not required  
**Rate Limit:** 50 requests per minute

**Response:**
```json
{
  "success": true,
  "settings": {
    "autoModerationEnabled": true,
    "profanityCheckEnabled": true,
    "hateSpeechCheckEnabled": true,
    "threatDetectionEnabled": true,
    "spamDetectionEnabled": true,
    "personalInfoCheckEnabled": true,
    "maxStrikes": 3,
    "firstStrikeBanHours": 24,
    "secondStrikeBanDays": 7,
    "defaultBanReason": "Violation of community guidelines",
    "warningMessage": "Your content has been flagged for review."
  }
}
```

### 2. Update Moderation Settings
**Endpoint:** `POST /api/moderation/settings`  
**Description:** Update moderation settings  
**Authentication:** Required  
**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "settings": {
    "autoModerationEnabled": true,
    "profanityCheckEnabled": true,
    "hateSpeechCheckEnabled": true,
    "threatDetectionEnabled": true,
    "spamDetectionEnabled": true,
    "personalInfoCheckEnabled": true,
    "maxStrikes": 3,
    "firstStrikeBanHours": 24,
    "secondStrikeBanDays": 7,
    "defaultBanReason": "Violation of community guidelines",
    "warningMessage": "Your content has been flagged for review."
  }
}
```

**Response:**
```json
{
  "success": true,
  "settings": {
    // Updated settings object
  },
  "message": "Moderation settings updated successfully"
}
```

---

## ❌ **Error Codes**

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

**Common Error Responses:**

```json
{
  "error": "User ID is required",
  "details": ["Invalid user ID format"]
}
```

```json
{
  "error": "Maximum 100 users can be checked at once"
}
```

```json
{
  "error": "Invalid settings",
  "details": [
    "autoModerationEnabled must be a boolean",
    "maxStrikes must be a number between 1 and 10"
  ]
}
```

---

## 💡 **Usage Examples**

### JavaScript/TypeScript

```typescript
// Check individual ban status
const checkBanStatus = async (userId: string) => {
  const response = await fetch(`/api/user/${userId}/ban-status`)
  const data = await response.json()
  return data
}

// Batch check ban status
const checkBatchBanStatus = async (userIds: string[]) => {
  const response = await fetch('/api/user/batch-ban-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds })
  })
  const data = await response.json()
  return data
}

// Get ban history with filters
const getBanHistory = async (filters: any) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`/api/moderation/ban-history?${params}`)
  const data = await response.json()
  return data
}

// Update moderation settings
const updateSettings = async (settings: any) => {
  const response = await fetch('/api/moderation/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings })
  })
  const data = await response.json()
  return data
}
```

### cURL Examples

```bash
# Check individual ban status
curl -X GET "https://your-domain.com/api/user/user123/ban-status"

# Batch check ban status
curl -X POST "https://your-domain.com/api/user/batch-ban-status" \
  -H "Content-Type: application/json" \
  -d '{"userIds": ["user1", "user2", "user3"]}'

# Get ban history with filters
curl -X GET "https://your-domain.com/api/moderation/ban-history?page=1&limit=20&status=active&search=john"

# Export ban history
curl -X GET "https://your-domain.com/api/moderation/ban-history/export?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output ban-history.csv

# Get analytics
curl -X GET "https://your-domain.com/api/moderation/ban-history/analytics?period=30d"

# Update settings
curl -X POST "https://your-domain.com/api/moderation/settings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"settings": {"autoModerationEnabled": true, "maxStrikes": 3}}'
```

---

## 🔒 **Security Considerations**

1. **Authentication**: Some endpoints require authentication for admin actions
2. **Rate Limiting**: All endpoints have rate limits to prevent abuse
3. **Input Validation**: All inputs are validated before processing
4. **Error Handling**: Sensitive information is not exposed in error messages
5. **CORS**: Configure CORS headers appropriately for your domain

---

## 📊 **Performance Notes**

1. **Batch Operations**: Use batch endpoints for multiple users to reduce API calls
2. **Pagination**: Use pagination for large datasets
3. **Caching**: Consider caching frequently accessed data
4. **Filtering**: Use filters to reduce data transfer
5. **Compression**: Enable gzip compression for large responses

---

## 🔄 **Future Enhancements**

- [ ] Real-time WebSocket updates for ban status changes
- [ ] GraphQL API for more flexible queries
- [ ] Advanced analytics with machine learning insights
- [ ] Bulk operations for ban management
- [ ] Webhook notifications for ban events
- [ ] API versioning for backward compatibility 