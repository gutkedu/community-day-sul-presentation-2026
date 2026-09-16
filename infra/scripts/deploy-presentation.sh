#!/usr/bin/env bash
set -euo pipefail
deploy_script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec node "$deploy_script_dir/deploy.mjs" presentation "$@"
