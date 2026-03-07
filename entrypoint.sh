#!/bin/sh
# Run schema migration against the persistent volume DB, then start the server
DATABASE_URL="file:/app/prisma/dev.db" node_modules/.bin/prisma db push --accept-data-loss --skip-generate 2>/dev/null || true
exec node server.js
