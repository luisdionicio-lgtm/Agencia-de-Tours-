#!/usr/bin/env bash
set -euo pipefail

if [ -z "${VERCEL_TOKEN:-}" ] || [ -z "${PROJECT_ID:-}" ]; then
  echo "Usage: VERCEL_TOKEN=... PROJECT_ID=... ./scripts/set-vercel-root.sh"
  echo "This will PATCH the Vercel project to set rootDirectory to 'frontend'."
  exit 1
fi

echo "Setting rootDirectory to 'frontend' for project: $PROJECT_ID"

resp=$(curl -s -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory":"frontend"}')

echo "$resp" | sed -n '1,200p'
echo "Done. If the API returned successfully, trigger a deploy next."
