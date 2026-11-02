#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="${HOME}/.nvm"
# shellcheck source=/dev/null
. "${NVM_DIR}/nvm.sh"

WIN_WRANGLER="/mnt/c/Users/pc/AppData/Roaming/xdg.config/.wrangler"
if [[ -d "${WIN_WRANGLER}" ]]; then
  mkdir -p "${HOME}/.config"
  rm -rf "${HOME}/.config/.wrangler"
  cp -a "${WIN_WRANGLER}" "${HOME}/.config/.wrangler"
  echo "Copied Wrangler credentials from Windows"
else
  echo "Windows Wrangler config not found at ${WIN_WRANGLER}"
  exit 1
fi

cd "${HOME}/projects/fish-hook"
npx wrangler whoami
npm run cf:deploy
