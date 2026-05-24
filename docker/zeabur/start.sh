#!/bin/sh
set -e

BACKEND_INTERNAL_PORT="${BACKEND_INTERNAL_PORT:-8081}"
export BACKEND_PORT="$BACKEND_INTERNAL_PORT"
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8080}"

if [ -n "${MYSQL_HOST:-}" ]; then
  echo "Starting backend on internal port ${BACKEND_INTERNAL_PORT}..."
  java -jar /app/backend.jar --server.port="${BACKEND_INTERNAL_PORT}" &
else
  echo "MYSQL_HOST not set — running frontend only (backend skipped)."
fi

envsubst '$PORT $HOST $BACKEND_PORT' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "Starting nginx on port ${PORT}..."
exec nginx -g 'daemon off;'
