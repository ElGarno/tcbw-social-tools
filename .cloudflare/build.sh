#!/usr/bin/env bash
set -euo pipefail

if [ ! -d ../tcbw-homepage ]; then
  cd ..
  git clone --depth 1 https://github.com/ElGarno/tcbw-homepage.git
  cd tcbw-social-tools
fi

npm run build
