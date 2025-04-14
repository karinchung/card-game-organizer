// netlify/functions/test.js
import { handler } from './api.js';

// Mock event object
const mockEvent = {
  httpMethod: 'GET',
  body: '',
  headers: {},
  queryStringParameters: {},
  path: '/.netlify/functions/api',
  isBase64Encoded: false,
};

// Mock context object
const mockContext = {};

// Run the test
async function runTest() {
  try {
    console.log('Testing Netlify function...');
    const result = await handler(mockEvent, mockContext);
    console.log('Function result:', result);
    
    if (result.statusCode === 200) {
      console.log('Test passed! Function returned 200 status code.');
      const body = JSON.parse(result.body);
      console.log('Response body:', body);
      
      if (body.cards && Array.isArray(body.cards)) {
        console.log(`Found ${body.cards.length} cards in the response.`);
      } else {
        console.error('Response does not contain a valid cards array.');
      }
    } else {
      console.error(`Test failed! Function returned ${result.statusCode} status code.`);
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
runTest(); 