/**
 * PM2 ecosystem file — runs all QuickBite microservices
 *
 * Usage:
 *   npm install -g pm2
 *   cp .env.example .env   (and fill in values)
 *   pm2 start ecosystem.config.js
 *   pm2 logs              (view all logs)
 *   pm2 stop all          (stop everything)
 *   pm2 delete all        (clean up)
 */

require('dotenv').config();

const SERVICES = [
  { name: 'api-gateway',         port: 3000 },
  { name: 'auth-service',        port: 3001 },
  { name: 'user-service',        port: 3002 },
  { name: 'restaurant-service',  port: 3003 },
  { name: 'food-service',        port: 3004 },
  { name: 'booking-service',     port: 3005 },
  { name: 'order-service',       port: 3006 },
  { name: 'payment-service',     port: 3007 },
  { name: 'review-service',      port: 3008 },
  { name: 'search-service',      port: 3009 },
  { name: 'location-service',    port: 3010 },
  { name: 'notification-service',port: 3011 },
  { name: 'admin-service',       port: 3012 },
  { name: 'analytics-service',   port: 3013 },
];

module.exports = {
  apps: SERVICES.map(({ name, port }) => ({
    name,
    script: `services/${name}/src/server.ts`,
    interpreter: 'node',
    interpreter_args: [
      '--require', 'ts-node/register',
      '--require', 'tsconfig-paths/register',
    ].join(' '),
    cwd: process.cwd(),
    watch: false,                     // set to true to auto-restart on file changes
    max_memory_restart: '300M',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      TS_NODE_PROJECT: `services/${name}/tsconfig.json`,
    },
    error_file: `logs/${name}-error.log`,
    out_file:   `logs/${name}-out.log`,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  })),
};
