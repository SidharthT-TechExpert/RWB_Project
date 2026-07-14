#!/bin/sh
# Runs the compiled JavaScript output for the service
# SERVICE_DIR is set at build time (e.g. services/auth-service)

exec node "${SERVICE_DIR}/dist/server.js"
