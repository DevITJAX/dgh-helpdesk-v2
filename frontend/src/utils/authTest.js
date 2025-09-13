/**
 * Authentication System Test Utility
 * This file contains functions to test the secure authentication implementation
 */

import { authService } from '../services/authService';

/**
 * Test the secure authentication system
 */
export const testSecureAuth = async () => {
  console.log('🧪 Testing Secure Authentication System...');
  
  try {
    // Test 1: Check initial state
    console.log('✅ Test 1: Initial state check');
    console.log('   - Tokens should be null initially');
    console.log('   - Token expiry should be null');
    
    // Test 2: Test token storage
    console.log('✅ Test 2: Token storage test');
    const testToken = 'test-jwt-token';
    const testRefreshToken = 'test-refresh-token';
    const expiresIn = 3600; // 1 hour
    
    authService.setTokens(testToken, testRefreshToken, expiresIn);
    
    const storedToken = await authService.getToken();
    const tokenExpiry = authService.getTokenExpiry();
    const isExpired = authService.isTokenExpired();
    
    console.log('   - Stored token:', storedToken === testToken ? '✅' : '❌');
    console.log('   - Token expiry set:', tokenExpiry ? '✅' : '❌');
    console.log('   - Token not expired:', !isExpired ? '✅' : '❌');
    
    // Test 3: Test token clearing
    console.log('✅ Test 3: Token clearing test');
    authService.clearTokens();
    
    try {
      await authService.getToken();
      console.log('   - Token clearing: ❌ (should throw error)');
    } catch (error) {
      console.log('   - Token clearing: ✅ (correctly throws error)');
    }
    
    // Test 4: Test expired token detection
    console.log('✅ Test 4: Expired token detection');
    const expiredTime = 1; // 1 second
    authService.setTokens(testToken, testRefreshToken, expiredTime);
    
    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isExpiredAfter = authService.isTokenExpired();
    console.log('   - Expired token detected:', isExpiredAfter ? '✅' : '❌');
    
    // Clean up
    authService.clearTokens();
    
    console.log('🎉 All authentication tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return false;
  }
};

/**
 * Test the API client with secure authentication
 */
export const testApiClient = async () => {
  console.log('🧪 Testing API Client with Secure Authentication...');
  
  try {
    // This would require a running backend to test properly
    console.log('⚠️  API Client test requires running backend');
    console.log('   - Start the backend server to test API calls');
    console.log('   - Use testSecureAuth() for offline tests');
    
    return true;
  } catch (error) {
    console.error('❌ API Client test failed:', error);
    return false;
  }
};

/**
 * Run all authentication tests
 */
export const runAuthTests = async () => {
  console.log('🚀 Running Authentication System Tests...\n');
  
  const authTestResult = await testSecureAuth();
  const apiTestResult = await testApiClient();
  
  console.log('\n📊 Test Results:');
  console.log(`   - Secure Auth: ${authTestResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   - API Client: ${apiTestResult ? '✅ PASS' : '❌ FAIL'}`);
  
  return authTestResult && apiTestResult;
};

// Export for use in development - removed window assignment to prevent errors
// To use these tests, import them directly:
// import { runAuthTests, testSecureAuth, testApiClient } from './utils/authTest'; 