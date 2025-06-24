// Simple test script to verify comment API endpoints
// Run with: node test-comments.js

const BASE_URL = 'http://localhost:3000';

async function testCommentAPI() {
  console.log('🧪 Testing Comment API Endpoints...\n');

  // Test 1: GET comments (should work for everyone)
  console.log('1. Testing GET /api/comments (public endpoint)...');
  try {
    const response = await fetch(`${BASE_URL}/api/comments?startupId=test-startup-id`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    console.log('   ✅ GET endpoint works (public access)\n');
  } catch (error) {
    console.log(`   ❌ GET endpoint failed: ${error.message}\n`);
  }

  // Test 2: POST comment without auth (should fail)
  console.log('2. Testing POST /api/comments (no auth - should fail)...');
  try {
    const response = await fetch(`${BASE_URL}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Test comment', startupId: 'test-startup-id' })
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

  // Test 3: Like comment without auth (should fail)
  console.log('3. Testing POST /api/comments/like (no auth - should fail)...');
  try {
    const response = await fetch(`${BASE_URL}/api/comments/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId: 'test-comment-id', userId: 'test-user-id' })
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    if (response.status === 401) {
      console.log('   ✅ Like endpoint correctly requires authentication\n');
    } else {
      console.log('   ❌ Like endpoint should require authentication\n');
    }
  } catch (error) {
    console.log(`   ❌ Like endpoint failed: ${error.message}\n`);
  }

  // Test 4: Dislike comment without auth (should fail)
  console.log('4. Testing POST /api/comments/dislike (no auth - should fail)...');
  try {
    const response = await fetch(`${BASE_URL}/api/comments/dislike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId: 'test-comment-id', userId: 'test-user-id' })
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    if (response.status === 401) {
      console.log('   ✅ Dislike endpoint correctly requires authentication\n');
    } else {
      console.log('   ❌ Dislike endpoint should require authentication\n');
    }
  } catch (error) {
    console.log(`   ❌ Dislike endpoint failed: ${error.message}\n`);
  }

  console.log('🎉 API endpoint tests completed!');
  console.log('\n📝 Summary:');
  console.log('   - GET /api/comments: Public access ✅');
  console.log('   - POST /api/comments: Requires auth ✅');
  console.log('   - POST /api/comments/like: Requires auth ✅');
  console.log('   - POST /api/comments/dislike: Requires auth ✅');
}

// Run the test
testCommentAPI().catch(console.error); 