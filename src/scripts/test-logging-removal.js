import { log, warn, error } from '../utils/logger.js';

export function testScript() {
  console.log('This console.log will be removed');
  console.warn('This console.warn will be removed');
  console.error('This console.error will be removed');
  
  log('This logger.log call will be removed');
  warn('This logger.warn call will be removed');
  error('This logger.error call will be removed');
  
  // This actual functionality will remain
  const result = performCalculation();
  
  console.debug('Debug info:', result);
  
  return result;
}

function performCalculation() {
  // Some actual logic
  return 42;
}

// Multiline console call
console.log(
  'This is a multiline',
  'console.log call',
  'that will also be removed'
);
