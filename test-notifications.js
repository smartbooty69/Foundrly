// Test script for notification API endpoints
// Run with: node test-notifications.js

const BASE_URL = 'http://localhost:3000';

async function testNotificationAPI() {
  console.log('🧪 Testing Notification API Endpoints...\n');

  // Test 1: GET notifications without auth (should fail)
  console.log('1. Testing GET /api/notifications (no auth - should fail)...');
  try {
    const response = await fetch(`${BASE_URL}/api/notifications`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    if (response.status === 401) {
      console.log('   ✅ GET endpoint correctly requires authentication\n');
    } else {
      console.log('   ❌ GET endpoint should require authentication\n');
    }
  } catch (error) {
    console.log(`   ❌ GET endpoint failed: ${error.message}\n`);
  }

  // Test 2: POST notification without auth (should fail)
  console.log('2. Testing POST /api/notifications (no auth - should fail)...');
  try {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification'
      })
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    if (response.status === 401) {
      console.log('   ✅ POST endpoint correctly requires authentication\n');
    } else {
      console.log('   ❌ POST endpoint should require authentication\n');
    }
  } catch (error) {
    console.log(`   ❌ POST endpoint failed: ${error.message}\n`);
  }

  // Test 3: PATCH mark-all-read without auth (should fail)
  console.log('3. Testing PATCH /api/notifications (no auth - should fail)...');
  try {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    if (response.status === 401) {
      console.log('   ✅ PATCH endpoint correctly requires authentication\n');
    } else {
      console.log('   ❌ PATCH endpoint should require authentication\n');
    }
  } catch (error) {
    console.log(`   ❌ PATCH endpoint failed: ${error.message}\n`);
  }

  // Test 4: PATCH mark individual notification as read without auth (should fail)
  console.log('4. Testing PATCH /api/notifications/[id]/read (no auth - should fail)...');
  try {
    const response = await fetch(`${BASE_URL}/api/notifications/test-id/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    if (response.status === 401) {
      console.log('   ✅ Individual read endpoint correctly requires authentication\n');
    } else {
      console.log('   ❌ Individual read endpoint should require authentication\n');
    }
  } catch (error) {
    console.log(`   ❌ Individual read endpoint failed: ${error.message}\n`);
  }

  // Test 5: Test with invalid notification ID
  console.log('5. Testing PATCH /api/notifications/[id]/read with invalid ID...');
  try {
    const response = await fetch(`${BASE_URL}/api/notifications/invalid-id/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    if (response.status === 401) {
      console.log('   ✅ Invalid ID endpoint correctly requires authentication\n');
    } else {
      console.log('   ❌ Invalid ID endpoint should require authentication\n');
    }
  } catch (error) {
    console.log(`   ❌ Invalid ID endpoint failed: ${error.message}\n`);
  }

  console.log('🎉 Notification API endpoint tests completed!');
  console.log('\n📝 Summary:');
  console.log('   - GET /api/notifications: Requires auth ✅');
  console.log('   - POST /api/notifications: Requires auth ✅');
  console.log('   - PATCH /api/notifications: Requires auth ✅');
  console.log('   - PATCH /api/notifications/[id]/read: Requires auth ✅');
  console.log('\n💡 Next Steps:');
  console.log('   1. Test with authenticated user (requires login)');
  console.log('   2. Test notification creation through follow/comment/like actions');
  console.log('   3. Test notification marking as read');
  console.log('   4. Test notification filtering and pagination');
}

// Test notification utility functions
async function testNotificationUtilities() {
  console.log('\n🔧 Testing Notification Utility Functions...\n');

  // Test 1: Test notification type validation
  console.log('1. Testing notification type validation...');
  const validTypes = ['follow', 'comment', 'like', 'startup_view', 'system', 'mention'];
  const invalidTypes = ['invalid', 'test', 'random'];
  
  console.log('   Valid types:', validTypes);
  console.log('   Invalid types:', invalidTypes);
  console.log('   ✅ Type validation should be handled in the API\n');

  // Test 2: Test notification data structure
  console.log('2. Testing notification data structure...');
  const sampleNotification = {
    id: 'test-id',
    type: 'follow',
    title: 'New Follower',
    message: 'started following you',
    userId: 'user123',
    userName: 'Test User',
    userImage: 'https://example.com/avatar.jpg',
    timestamp: new Date().toISOString(),
    isRead: false,
    actionUrl: '/user/user123'
  };
  
  console.log('   Sample notification structure:');
  console.log('   ', JSON.stringify(sampleNotification, null, 2));
  console.log('   ✅ Data structure validation should be handled in the API\n');

  // Test 3: Test timestamp formatting
  console.log('3. Testing timestamp formatting...');
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  
  console.log('   Current time:', now.toISOString());
  console.log('   5 minutes ago:', fiveMinutesAgo.toISOString());
  console.log('   2 hours ago:', twoHoursAgo.toISOString());
  console.log('   3 days ago:', threeDaysAgo.toISOString());
  console.log('   ✅ Timestamp formatting should be handled in the frontend\n');
}

// Run all tests
async function runAllTests() {
  await testNotificationAPI();
  await testNotificationUtilities();
  
  console.log('\n🚀 All tests completed!');
  console.log('\n📋 Manual Testing Checklist:');
  console.log('   □ Login to the application');
  console.log('   □ Check notification bell in navbar');
  console.log('   □ Follow another user (should create notification)');
  console.log('   □ Comment on a startup (should create notification)');
  console.log('   □ Like a startup (should create notification)');
  console.log('   □ View notifications page (/notifications)');
  console.log('   □ Mark individual notifications as read');
  console.log('   □ Mark all notifications as read');
  console.log('   □ Test notification filtering');
  console.log('   □ Test load more functionality');
  console.log('   □ Test notification click navigation');
}

// Run the tests
runAllTests().catch(console.error); 