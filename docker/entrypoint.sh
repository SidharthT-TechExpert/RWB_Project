#!/bin/sh
# Starts the service using ts-node with transpile-only mode
# SERVICE_DIR is set at build time (e.g. services/auth-service)

exec node \
  --require ts-node/register \
  --require tsconfig-paths/register \
  "${SERVICE_DIR}/src/server.ts"
