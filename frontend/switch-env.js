#!/usr/bin/env node

/**
 * Environment switcher script for DGH Helpdesk
 * Usage: node switch-env.js [local|production]
 */

const fs = require('fs');
const path = require('path');

const env = process.argv[2];

if (!env || !['local', 'production'].includes(env)) {
  console.log('Usage: node switch-env.js [local|production]');
  console.log('');
  console.log('Examples:');
  console.log('  node switch-env.js local      # Switch to localhost development');
  console.log('  node switch-env.js production # Switch to Azure production');
  process.exit(1);
}

const configs = {
  local: {
    apiUrl: 'http://localhost:8080',
    description: 'Local development (localhost:8080)'
  },
  production: {
    apiUrl: 'http://dgh-helpdesk-backend-westus2.westus2.azurecontainer.io:8080',
    description: 'Azure production deployment'
  }
};

const config = configs[env];
const apiClientPath = path.join(__dirname, 'src', 'services', 'apiClient.js');

try {
  let content = fs.readFileSync(apiClientPath, 'utf8');
  
  // Update the baseURL in apiClient.js
  const baseUrlRegex = /baseURL:\s*process\.env\.REACT_APP_API_BASE_URL\s*\|\|\s*'[^']*'/;
  const newBaseUrl = `baseURL: process.env.REACT_APP_API_BASE_URL || '${config.apiUrl}'`;
  
  content = content.replace(baseUrlRegex, newBaseUrl);
  
  fs.writeFileSync(apiClientPath, content);
  
  console.log(`✅ Switched to ${env} environment`);
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   Description: ${config.description}`);
  console.log('');
  console.log('Next steps:');
  if (env === 'local') {
    console.log('1. Start your backend: cd backend && ./mvnw spring-boot:run');
    console.log('2. Start your frontend: cd frontend && npm start');
  } else {
    console.log('1. Deploy your backend to Azure');
    console.log('2. Deploy your frontend to Azure');
  }
  
} catch (error) {
  console.error('❌ Error switching environment:', error.message);
  process.exit(1);
}
