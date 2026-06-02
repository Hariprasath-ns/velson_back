#!/bin/sh
set -e

echo "[startup] Running database migrations..."

run_migrate() {
  set +e
  OUT=$(npx prisma migrate deploy 2>&1)
  EXIT=$?
  set -e
  echo "$OUT"
  echo "$EXIT"
}

# --- First attempt ---
set +e
MIGRATE_OUT=$(npx prisma migrate deploy 2>&1)
MIGRATE_EXIT=$?
set -e

echo "$MIGRATE_OUT"

if [ $MIGRATE_EXIT -eq 0 ]; then
  : # success, continue
elif echo "$MIGRATE_OUT" | grep -q "P3009"; then
  # Stuck failed migration — mark rolled-back and retry
  FAILED=$(echo "$MIGRATE_OUT" | grep "The \`" | sed "s/.*The \`\([^\`]*\)\` migration.*/\1/")
  if [ -z "$FAILED" ]; then
    echo "[startup] P3009 detected but could not extract migration name — exiting"
    exit 1
  fi
  echo "[startup] Auto-resolving stuck migration (P3009): $FAILED"
  npx prisma migrate resolve --rolled-back "$FAILED"

  # --- Second attempt ---
  set +e
  MIGRATE_OUT2=$(npx prisma migrate deploy 2>&1)
  MIGRATE_EXIT2=$?
  set -e
  echo "$MIGRATE_OUT2"

  if [ $MIGRATE_EXIT2 -eq 0 ]; then
    : # success
  elif echo "$MIGRATE_OUT2" | grep -q "42P07"; then
    # Table already exists in DB — migration was partially applied; mark as applied
    FAILED2=$(echo "$MIGRATE_OUT2" | grep "Migration name:" | sed "s/.*Migration name: *//" | tr -d '[:space:]')
    if [ -z "$FAILED2" ]; then
      echo "[startup] P3018 (42P07) detected but could not extract migration name — exiting"
      exit 1
    fi
    echo "[startup] Table already exists; marking migration as applied: $FAILED2"
    npx prisma migrate resolve --applied "$FAILED2"

    # --- Third attempt (should succeed now) ---
    echo "[startup] Final migration retry..."
    npx prisma migrate deploy
  else
    exit 1
  fi

elif echo "$MIGRATE_OUT" | grep -q "42P07"; then
  # First attempt itself hit "relation already exists" — mark applied directly
  FAILED=$(echo "$MIGRATE_OUT" | grep "Migration name:" | sed "s/.*Migration name: *//" | tr -d '[:space:]')
  if [ -z "$FAILED" ]; then
    echo "[startup] 42P07 detected but could not extract migration name — exiting"
    exit 1
  fi
  echo "[startup] Table already exists; marking migration as applied: $FAILED"
  npx prisma migrate resolve --applied "$FAILED"
  echo "[startup] Retrying migration deploy..."
  npx prisma migrate deploy
else
  exit 1
fi

echo "[startup] Migrations complete."

if [ "${SEED_DB}" = "true" ]; then
  echo "[startup] Seeding database..."
  npm run seed || echo "[startup] Warning: seedreferencetypename.js failed (skipping)"
  # node seedreferencetypename.js   || echo "[startup] Warning: seedreferencetypename.js failed (skipping)"
  # node seedReferenceMaster.js     || echo "[startup] Warning: seedReferenceMaster.js failed (skipping)"
  # node seedPartNumberBase.js      || echo "[startup] Warning: seedPartNumberBase.js failed (skipping)"
  # node seedSupplierMaster.js      || echo "[startup] Warning: seedSupplierMaster.js failed (skipping)"
  # node seedCustomerMaster.js      || echo "[startup] Warning: seedCustomerMaster.js failed (skipping)"
  # node seedPurchaseRequest.js     || echo "[startup] Warning: seedPurchaseRequest.js failed (skipping)"
  # node seedPurchaseMaster.js      || echo "[startup] Warning: seedPurchaseMaster.js failed (skipping)"
  # node prisma/seedAuthUsers.js    || echo "[startup] Warning: seedAuthUsers.js failed (skipping)"
  echo "[startup] Seeding complete."
fi

echo "[startup] Starting server..."
exec node src/server.js
