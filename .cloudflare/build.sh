#!/usr/bin/env bash
set -euo pipefail

ORIG_DIR=$(pwd)

if [ ! -d ../tcbw-homepage ]; then
  cd ..
  git clone --depth 1 https://github.com/ElGarno/tcbw-homepage.git
  cd "$ORIG_DIR"
fi

npm run build
