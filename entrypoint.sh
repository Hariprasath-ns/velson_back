#!/bin/sh
set -e

echo "[startup] Starting application..."

############################################
# RUN PRISMA MIGRATIONS
############################################

echo "[startup] Running database migrations..."

# Set DATABASE_URL for Prisma
if [ "$DB_ENV" = "docker" ]; then
  export DATABASE_URL="$DOCKER_DATABASE_URL"
fi

run_migration() {
  set +e
  OUTPUT=$(npx prisma migrate deploy 2>&1)
  EXIT_CODE=$?
  set -e

  echo "$OUTPUT"

  return $EXIT_CODE
}

############################################
# FIRST ATTEMPT
############################################

if run_migration; then
  echo "[startup] Migration successful."
else

  ############################################
  # HANDLE FAILED MIGRATION (P3009)
  ############################################

  if echo "$OUTPUT" | grep -q "P3009"; then

    echo "[startup] Failed migration detected (P3009)."

    FAILED_MIGRATION=$(echo "$OUTPUT" \
      | grep "The \`" \
      | sed 's/.*The `\([^`]*\)` migration.*/\1/')

    if [ -z "$FAILED_MIGRATION" ]; then
      echo "[startup] Could not extract migration name."
      exit 1
    fi

    echo "[startup] Marking rolled back: $FAILED_MIGRATION"

    npx prisma migrate resolve \
      --rolled-back "$FAILED_MIGRATION"

    echo "[startup] Retrying migration..."

    ############################################
    # SECOND ATTEMPT
    ############################################

    if run_migration; then
      echo "[startup] Migration retry successful."
    else

      ############################################
      # HANDLE 42P07 SAFELY
      ############################################

      if echo "$OUTPUT" | grep -q "42P07"; then

        echo ""
        echo "[startup] ERROR: Relation/Table already exists (42P07)"
        echo "[startup] Manual migration review required."
        echo ""
        echo "Possible causes:"
        echo " - Partial migration execution"
        echo " - Existing schema mismatch"
        echo " - Client DB drift"
        echo ""
        echo "Recommended action:"
        echo "1. Check migration status"
        echo "2. Verify DB schema manually"
        echo "3. Resolve migration intentionally"
        echo ""
        echo "Commands:"
        echo "  npx prisma migrate status"
        echo "  npx prisma migrate resolve --applied <migration>"
        echo ""

        exit 1
      fi

      echo "[startup] Migration retry failed."
      exit 1
    fi

  else
    echo "[startup] Migration failed."
    exit 1
  fi
fi

echo "[startup] Database migrations complete."

############################################
# OPTIONAL SEEDING
############################################

if [ "$SEED_DB" = "true" ]; then

  echo "[startup] Running database seed..."

  npm run seed || {
    echo "[startup] Warning: seed failed."
  }

  echo "[startup] Seeding complete."
fi

############################################
# START SERVER
############################################

echo "[startup] Starting Node server..."

exec node src/server.js