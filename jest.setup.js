// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Add OpenAI Node.js shim for fetch API
import 'openai/shims/node'

// Polyfill TextEncoder for Node.js environment
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill ReadableStream for Node.js environment
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = require('web-streams-polyfill/dist/ponyfill.js').ReadableStream;
}

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-api-key'
process.env.LOGTAIL_SOURCE_TOKEN = 'test-logtail-token'
process.env.LOGTAIL_INGESTING_HOST = 'test-host'
process.env.LOGTAIL_ENABLED = 'false'
process.env.LOG_LEVEL = 'error'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} 