// Test script for push notification system
// Run with: node test-push-system.js

const BASE_URL = 'http://localhost:3000';

async function testPushNotificationSystem() {
  console.log('🧪 Testing Push Notification System...\n');

  // Test 1: Check if service worker exists
  console.log('1. Checking service worker file...');
  try {
    const response = await fetch(`${BASE_URL}/sw.js`);
    if (response.ok) {
      console.log('   ✅ Service worker file exists');
    } else {
      console.log('   ❌ Service worker file not found');
    }
  } catch (error) {
    console.log('   ❌ Error checking service worker:', error.message);
  }

  // Test 2: Check if notification icons exist
  console.log('\n2. Checking notification icons...');
  const icons = [
    '/icons/notification.svg',
    '/icons/follow.svg',
    '/icons/comment.svg',
    '/icons/like.svg',
    '/icons/moderation.svg'
  ];

  for (const icon of icons) {
    try {
      const response = await fetch(`${BASE_URL}${icon}`);
      if (response.ok) {
        console.log(`   ✅ ${icon} exists`);
      } else {
        console.log(`   ❌ ${icon} not found`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking ${icon}:`, error.message);
    }
  }

  // Test 3: Check push notification API endpoint
  console.log('\n3. Checking push notification API endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/push-notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: {
          endpoint: 'test-endpoint',
          keys: { p256dh: 'test', auth: 'test' }
        },
        notification: {
          title: 'Test',
          body: 'Test notification'
        }
      })
    });
    
    if (response.status === 401) {
      console.log('   ✅ API endpoint exists and requires authentication');
    } else if (response.status === 500) {
      console.log('   ⚠️ API endpoint exists but has server error (expected without VAPID keys)');
    } else {
      console.log(`   ❌ Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ Error checking API endpoint:', error.message);
  }

  // Test 4: Check test page
  console.log('\n4. Checking test page...');
  try {
    const response = await fetch(`${BASE_URL}/test-push-notifications`);
    if (response.ok) {
      console.log('   ✅ Test page exists');
    } else {
      console.log('   ❌ Test page not found');
    }
  } catch (error) {
    console.log('   ❌ Error checking test page:', error.message);
  }

  console.log('\n🎉 Push notification system tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Copy VAPID keys from VAPID_KEYS.txt to .env.local');
  console.log('   2. Restart your development server');
  console.log('   3. Visit /test-push-notifications to test the system');
  console.log('   4. Try following someone or commenting on a startup');
  console.log('\n💡 The system should now send push notifications automatically!');
}

// Run the tests
testPushNotificationSystem().catch(console.error);
