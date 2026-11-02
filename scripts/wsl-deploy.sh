#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="${HOME}/.nvm"
# shellcheck source=/dev/null
. "${NVM_DIR}/nvm.sh"

ROOT="${HOME}/projects/fish-hook"
cd "${ROOT}"

# Keep build script complete for Linux builds
npm pkg set scripts.build="prisma generate && next build"

echo "==> Wrangler identity"
if ! npx wrangler whoami; then
  echo "Wrangler is not logged in inside WSL."
  echo "Will build here, then deploy with Windows-authenticated wrangler."
fi

echo "==> OpenNext Cloudflare build"
npm run cf:build

echo "==> Sync build artifacts back to Windows tree"
WIN_ROOT="/mnt/c/shabeeb/fish-hook/fish-hook"
rm -rf "${WIN_ROOT}/.open-next"
cp -a "${ROOT}/.open-next" "${WIN_ROOT}/.open-next"
cp -a "${ROOT}/wrangler.jsonc" "${WIN_ROOT}/wrangler.jsonc"

echo "==> Deploy via Wrangler"
if npx wrangler whoami >/dev/null 2>&1; then
  npm run cf:deploy
else
  echo "Skipping WSL deploy (no auth). Artifacts copied for Windows deploy."
fi

echo "WSL build complete."
