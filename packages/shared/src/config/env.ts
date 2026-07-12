import path from 'path';
import dotenv from 'dotenv';

// Walk up directories to find the monorepo root .env
// Works whether called from dist/ or src/
const findRootEnv = (): string => {
  // __dirname will be something like:
  // .../Qickbite/packages/shared/src/config  (ts-node)
  // .../Qickbite/packages/shared/dist/config (compiled)
  // Walk up 4 levels to reach Qickbite/
  return path.resolve(__dirname, '../../../../.env');
};

const result = dotenv.config({ path: findRootEnv() });

if (result.error) {
  // Fallback: try process.cwd()/.env (works when run from root)
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}
