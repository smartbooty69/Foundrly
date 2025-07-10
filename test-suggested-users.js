// Test script for suggested users API
const testSuggestedUsers = async () => {
  try {
    // Replace with an actual user ID from your database
    const currentUserId = 'your-test-user-id';
    
    const response = await fetch(`http://localhost:3000/api/users/suggested?currentUserId=${currentUserId}&limit=10`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('Suggested Users API Response:');
    console.log('Total users:', data.count);
    console.log('Breakdown:', data.breakdown);
    console.log('Users:', data.users.map(u => ({
      name: u.name,
      username: u.username,
      type: u.type
    })));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testSuggestedUsers(); 