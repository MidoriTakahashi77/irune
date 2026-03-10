#!/bin/bash
set -euo pipefail

# ============================================================
# E2E Test Runner
# ============================================================
# Usage:
#   ./scripts/run-e2e.sh
#
# Set these in .env.e2e (or export them before running):
#   SUPABASE_URL              - Supabase project URL
#   SUPABASE_SECRET_KEY       - Secret key (sb_secret_...)
#   SUPABASE_PUBLISHABLE_KEY  - Publishable key (sb_publishable_...)
#
# Optional:
#   E2E_TEST_FILE             - Run a specific test file (default: all)
# ============================================================

# Load .env.e2e if it exists
if [ -f .env.e2e ]; then
  set -a
  source .env.e2e
  set +a
fi

# Fallback: derive from .env if not set
if [ -z "${SUPABASE_URL:-}" ]; then
  SUPABASE_URL=$(grep EXPO_PUBLIC_SUPABASE_URL .env | cut -d= -f2-)
  export SUPABASE_URL
fi
if [ -z "${SUPABASE_PUBLISHABLE_KEY:-}" ]; then
  SUPABASE_PUBLISHABLE_KEY=$(grep EXPO_PUBLIC_SUPABASE_KEY .env | cut -d= -f2-)
  export SUPABASE_PUBLISHABLE_KEY
fi

if [ -z "${SUPABASE_SECRET_KEY:-}" ]; then
  echo "❌ SUPABASE_SECRET_KEY is required."
  echo "   Set it in .env.e2e or export it before running."
  echo ""
  echo "   Find it at: https://supabase.com/dashboard → Settings → API Keys → Secret key"
  exit 1
fi

echo "🔧 Step 1: Setting up test data..."
SETUP_OUTPUT=$(bun run scripts/e2e-setup.ts 2>&1) || {
  echo "$SETUP_OUTPUT"
  echo ""
  echo "❌ Setup script failed"
  exit 1
}
echo "$SETUP_OUTPUT"

# Extract deep link from output
E2E_DEEP_LINK=$(echo "$SETUP_OUTPUT" | grep "E2E_DEEP_LINK=" | cut -d= -f2-)
if [ -z "$E2E_DEEP_LINK" ]; then
  echo "❌ Failed to get E2E_DEEP_LINK from setup script"
  exit 1
fi

export E2E_DEEP_LINK

echo ""
echo "🚀 Step 2: Running Maestro tests..."
echo ""

if [ -n "${E2E_TEST_FILE:-}" ]; then
  echo "Running: $E2E_TEST_FILE"
  maestro test "$E2E_TEST_FILE" -e E2E_DEEP_LINK="$E2E_DEEP_LINK"
else
  echo "Running all calendar E2E tests..."
  maestro test .maestro/calendar-create-event.yaml -e E2E_DEEP_LINK="$E2E_DEEP_LINK"
  maestro test .maestro/calendar-recurrence-verify.yaml -e E2E_DEEP_LINK="$E2E_DEEP_LINK"
  maestro test .maestro/calendar-multiday-event.yaml -e E2E_DEEP_LINK="$E2E_DEEP_LINK"
fi

echo ""
echo "✅ All E2E tests complete!"
