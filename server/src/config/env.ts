/**
 * Environment loader — runs before anything else in server.ts
 *
 * Order of precedence (highest → lowest):
 *   1. process.env already set (Docker / OS / CI)
 *   2. Infisical (fetched at runtime via SDK)
 *   3. server/.env file (local development fallback)
 *   4. root .env file (legacy fallback)
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env files first so INFISICAL_* vars are available
// when loadSecretsFromInfisical() is called from server.ts
dotenv.config({ path: path.resolve(__dirname, '../../.env') });       // server/.env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });         // root .env (fallback)
