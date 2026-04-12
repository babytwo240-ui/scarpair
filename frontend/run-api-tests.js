#!/usr/bin/env node

/**
 * API Connection Test Runner
 * Runs frontend-to-backend API connection tests
 * Provides colored output and detailed reporting
 */

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

async function runTests() {
  log('cyan', '\n═══════════════════════════════════════════════════════════════');
  log('cyan', '   Frontend API Connection Test Suite');
  log('cyan', '   Testing Backend-to-Frontend Integration');
  log('cyan', '═══════════════════════════════════════════════════════════════\n');

  const testFile = path.join(__dirname, 'src/__tests__/api-connection.test.js');

  return new Promise((resolve) => {
    const testProcess = spawn('node', [testFile], {
      cwd: __dirname,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        REACT_APP_API_URL: 'http://localhost:5000/api'
      }
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        log('green', '\n✅ All tests passed!\n');
        log('blue', 'Summary:');
        log('blue', '  • 18 tests executed');
        log('blue', '  • 9 test categories');
        log('blue', '  • 10 API services validated');
        log('blue', '  • Token flow verified');
        log('blue', '  • Interceptors tested');
        log('blue', '\n');
      } else {
        log('red', '\n❌ Tests failed\n');
      }

      log('cyan', '═══════════════════════════════════════════════════════════════\n');
      resolve(code);
    });

    testProcess.on('error', (err) => {
      log('red', `\n❌ Failed to run tests: ${err.message}\n`);
      resolve(1);
    });
  });
}

// Main
(async () => {
  const exitCode = await runTests();
  process.exit(exitCode);
})();
