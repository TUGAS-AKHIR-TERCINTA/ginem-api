#!/bin/sh
set -e

wait_for_service() {
  host="$1"
  port="$2"
  name="$3"

  echo "Waiting for ${name} at ${host}:${port}..."
  until node -e "
    const net = require('net');
    const socket = net.createConnection({ host: '${host}', port: ${port} });
    socket.on('connect', () => { socket.end(); process.exit(0); });
    socket.on('error', () => process.exit(1));
  "; do
    sleep 2
  done
  echo "${name} is ready."
}

if [ -n "${DB_HOST}" ] && [ -n "${DB_PORT}" ]; then
  wait_for_service "${DB_HOST}" "${DB_PORT}" "MySQL"
fi

if [ -n "${REDIS_HOST}" ] && [ -n "${REDIS_PORT}" ]; then
  wait_for_service "${REDIS_HOST}" "${REDIS_PORT}" "Redis"
fi

if [ "${RUN_MIGRATIONS}" = "true" ]; then
  echo "Running database migrations..."
  npx sequelize-cli db:migrate
fi

exec "$@"
