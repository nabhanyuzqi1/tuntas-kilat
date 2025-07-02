#!/usr/bin/env node

// Production startup script that ensures environment variables are loaded
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure environment variables are available
const requiredEnvVars = ['DATABASE_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('Available DB-related environment variables:');
  Object.keys(process.env)
    .filter(key => key.includes('DB') || key.includes('PG'))
    .forEach(key => console.error(`  ${key}=${process.env[key]}`));
  process.exit(1);
}

console.log('✅ Environment variables check passed');
console.log('🚀 Starting Tuntas Kilat in production mode...');

// Start the application
const child = spawn('node', [join(__dirname, 'dist', 'index.js')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

child.on('error', (error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`❌ Application exited with code ${code}`);
  }
  if (signal) {
    console.error(`❌ Application killed with signal ${signal}`);
  }
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  child.kill('SIGTERM');
});