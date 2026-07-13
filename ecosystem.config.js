/**
 * PM2 ecosystem — QuickBite microservices
 *
 * Usage:
 *   pm2 start ecosystem.config.js   # start all
 *   pm2 logs                         # view all logs
 *   pm2 monit                        # live dashboard
 *   pm2 restart all                  # restart all
 *   pm2 stop all                     # stop all
 *   pm2 delete all                   # clean up
 */

const path = require('path');
const root = __dirname;

// ts-node with SWC transpiler — much faster than default tsc
const TS_NODE = 'node -r @swc-node/register -r tsconfig-paths/register';

const SERVICES = [
  { name: 'api-gateway',          port: 3000 },
  { name: 'auth-service',         port: 3001 },
  { name: 'user-service',         port: 3002 },
  { name: 'restaurant-service',   port: 3003 },
  { name: 'food-service',         port: 3004 },
  { name: 'booking-service',      port: 3005 },
  { name: 'order-service',        port: 3006 },
  { name: 'payment-service',      port: 3007 },
  { name: 'review-service',       port: 3008 },
  { name: 'search-service',       port: 3009 },
  { name: 'location-service',     port: 3010 },
  { name: 'notification-service', port: 3011 },
  { name: 'admin-service',        port: 3012 },
  { name: 'analytics-service',    port: 3013 },
];

module.exports = {
  apps: SERVICES.map(({ name, port }) => ({
    name,
    script: path.join(root, `services/${name}/src/server.ts`),
    interpreter: 'node',
    interpreter_args: '--require ts-node/register --require tsconfig-paths/register',
    cwd: root,
    watch: false,
    max_memory_restart: '400M',
    kill_timeout: 5000,
    wait_ready: false,
    env: {
      NODE_ENV: 'development',
      TS_NODE_PROJECT: path.join(root, `services/${name}/tsconfig.json`),
      TS_NODE_TRANSPILE_ONLY: 'true',   // skip type checking = much faster startup
      TS_NODE_FILES: 'true',
    },
    error_file: path.join(root, `logs/${name}-error.log`),
    out_file: path.join(root, `logs/${name}-out.log`),
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  })),
};
