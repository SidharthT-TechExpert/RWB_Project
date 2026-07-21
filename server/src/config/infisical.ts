/**
 * Infisical Secret Manager
 *
 * Fetches all secrets from Infisical and injects them into process.env
 * before the application starts.
 *
 * Environments:
 *   development  →  INFISICAL_ENV=dev     (default)
 *   staging      →  INFISICAL_ENV=staging
 *   production   →  INFISICAL_ENV=prod
 *
 * Auth (Machine Identity — Universal Auth):
 *   INFISICAL_CLIENT_ID     → Machine Identity Client ID
 *   INFISICAL_CLIENT_SECRET → Machine Identity Client Secret
 *   INFISICAL_PROJECT_ID    → Infisical Project ID
 *
 * Optional:
 *   INFISICAL_SITE_URL      → Self-hosted instance URL (default: https://app.infisical.com)
 *   INFISICAL_ENV           → Override environment slug (default: dev)
 */

import { InfisicalSDK } from '@infisical/sdk';
import { logger } from './logger';

export const loadSecretsFromInfisical = async (): Promise<void> => {
  const clientId = process.env.INFISICAL_CLIENT_ID;
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
  const projectId = process.env.INFISICAL_PROJECT_ID;

  // Skip if Infisical is not configured — fall back to .env file
  if (!clientId || !clientSecret || !projectId) {
    logger.info('Infisical not configured — using local .env file');
    return;
  }

  const siteUrl = process.env.INFISICAL_SITE_URL || 'https://app.infisical.com';
  const environment = process.env.INFISICAL_ENV ||
    (process.env.NODE_ENV === 'production' ? 'prod' :
     process.env.NODE_ENV === 'staging' ? 'staging' : 'dev');

  logger.info(`Loading secrets from Infisical [env: ${environment}]...`);

  try {
    const client = new InfisicalSDK({ siteUrl });

    // Authenticate with Machine Identity (Universal Auth)
    await client.auth().universalAuth.login({
      clientId,
      clientSecret,
    });

    // Fetch all secrets for this environment
    const { secrets } = await client.secrets().listSecrets({
      projectId,
      environment,
      secretPath: '/',
      expandSecretReferences: true,
      includeImports: true,
    });

    let injected = 0;

    for (const secret of secrets) {
      // Only inject if not already set (local env takes precedence in dev)
      if (process.env.NODE_ENV !== 'production' && process.env[secret.secretKey] !== undefined) {
        continue; // local .env overrides Infisical in development
      }
      process.env[secret.secretKey] = secret.secretValue;
      injected++;
    }

    logger.info(`Infisical: injected ${injected} secrets into process.env`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (process.env.NODE_ENV === 'production') {
      // In production, fail hard — secrets are required
      logger.error(`Failed to load secrets from Infisical: ${message}`);
      process.exit(1);
    } else {
      // In development, warn and fall back to .env file
      logger.warn(`Infisical unavailable (${message}) — falling back to .env file`);
    }
  }
};
