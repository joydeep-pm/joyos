#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

if [[ -d "$ROOT_DIR/web" ]]; then
  cd "$ROOT_DIR/web"
  npm run typecheck
  npm run test
fi
