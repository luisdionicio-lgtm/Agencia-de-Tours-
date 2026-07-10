#!/usr/bin/env bash
set -euo pipefail

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "Usage: VERCEL_TOKEN=... ./scripts/deploy-frontend-vercel.sh"
  echo "This will run 'vercel' to deploy the frontend folder." 
  exit 1
fi

echo "Deploying frontend with Vercel (cwd=frontend)..."

# prefer npx to avoid requiring global install
npx vercel --prod --confirm --cwd frontend --token "$VERCEL_TOKEN"
