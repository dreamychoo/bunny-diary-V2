#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ALIYUN_DEPLOY_ENV_FILE:-$ROOT_DIR/.deploy.aliyun.env}"
DIST_DIR="${ALIYUN_DIST_DIR:-$ROOT_DIR/dist}"
TMP_OSSUTIL_CONFIG=""

CHECK_ONLY=0
SKIP_BUILD=0

usage() {
  cat <<'EOF'
Usage:
  bash tools/deploy-aliyun-static.sh [--check] [--skip-build]

What it does:
  1. Builds the Vite app
  2. Syncs dist/ to Alibaba Cloud OSS
  3. Refreshes Alibaba Cloud CDN cache for the site directory

Setup:
  1. Copy `.deploy.aliyun.example.env` to `.deploy.aliyun.env`
  2. Fill in bucket + site URL
  3. Run `aliyun configure` once
EOF
}

while (($# > 0)); do
  case "$1" in
    --check)
      CHECK_ONLY=1
      ;;
    --skip-build)
      SKIP_BUILD=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[error] Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "[error] Missing required config: $name" >&2
    echo "[hint] Copy .deploy.aliyun.example.env to .deploy.aliyun.env and fill it in." >&2
    exit 1
  fi
}

cleanup() {
  if [[ -n "$TMP_OSSUTIL_CONFIG" && -f "$TMP_OSSUTIL_CONFIG" ]]; then
    rm -f "$TMP_OSSUTIL_CONFIG"
  fi
}

trap cleanup EXIT

find_ossutil() {
  if [[ -n "${ALIYUN_OSSUTIL_BIN:-}" ]]; then
    echo "$ALIYUN_OSSUTIL_BIN"
    return
  fi

  for candidate in "$HOME/.local/bin/ossutil" "$HOME/.local/bin/ossutil64"; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  done

  for candidate in ossutil ossutil64; do
    if command -v "$candidate" >/dev/null 2>&1; then
      echo "$candidate"
      return
    fi
  done
}

tolower() {
  echo "$1" | tr '[:upper:]' '[:lower:]'
}

make_ossutil_config_from_aliyun() {
  local aliyun_config_file="${ALIYUN_CONFIG_FILE:-$HOME/.aliyun/config.json}"

  if [[ ! -f "$aliyun_config_file" ]]; then
    return 1
  fi

  if ! command -v python3 >/dev/null 2>&1; then
    echo "[error] python3 is required to reuse aliyun CLI credentials." >&2
    return 1
  fi

  TMP_OSSUTIL_CONFIG="$(mktemp "${TMPDIR:-/tmp}/ossutil.XXXXXX")"

  if ! python3 - "$aliyun_config_file" "$TMP_OSSUTIL_CONFIG" <<'PY'
import json
import pathlib
import sys

config_path = pathlib.Path(sys.argv[1])
output_path = pathlib.Path(sys.argv[2])
profile_name = "default"

config = json.loads(config_path.read_text())
profiles = config.get("profiles", [])
profile = next((item for item in profiles if item.get("name") == profile_name), None)

if not profile:
    raise SystemExit(1)

access_key_id = profile.get("access_key_id")
access_key_secret = profile.get("access_key_secret")

if not access_key_id or not access_key_secret:
    raise SystemExit(1)

output_path.write_text(
    "[Credentials]\n"
    "language=CH\n"
    f"accessKeyID={access_key_id}\n"
    f"accessKeySecret={access_key_secret}\n"
)
PY
  then
    rm -f "$TMP_OSSUTIL_CONFIG"
    TMP_OSSUTIL_CONFIG=""
    return 1
  fi

  echo "$TMP_OSSUTIL_CONFIG"
}

require_env "ALIYUN_OSS_BUCKET"

OSSUTIL_BIN="$(find_ossutil || true)"
ALIYUN_CLI_BIN="${ALIYUN_CLI_BIN:-$(command -v aliyun || true)}"

if [[ -z "$OSSUTIL_BIN" ]]; then
  echo "[error] ossutil is not installed." >&2
  echo "[hint] Install guide: https://www.alibabacloud.com/help/en/oss/developer-reference/install-ossutil" >&2
  exit 1
fi

OSS_PREFIX="${ALIYUN_OSS_PREFIX:-}"
OSS_PREFIX="${OSS_PREFIX#/}"
if [[ -n "$OSS_PREFIX" && "$OSS_PREFIX" != */ ]]; then
  OSS_PREFIX="$OSS_PREFIX/"
fi

OSS_DEST="oss://${ALIYUN_OSS_BUCKET}/${OSS_PREFIX}"

SITE_URL="${ALIYUN_SITE_URL:-}"
SITE_URL="${SITE_URL%/}"
CDN_REFRESH_DIRECTORY="${ALIYUN_CDN_REFRESH_DIRECTORY:-}"

if [[ -z "$CDN_REFRESH_DIRECTORY" && -n "$SITE_URL" ]]; then
  CDN_REFRESH_DIRECTORY="${SITE_URL}/"
  if [[ -n "$OSS_PREFIX" ]]; then
    CDN_REFRESH_DIRECTORY="${SITE_URL}/${OSS_PREFIX}"
  fi
fi

REFRESH_FORCE="$(tolower "${ALIYUN_REFRESH_FORCE:-true}")"
OSSUTIL_CONFIG_FILE="${ALIYUN_OSSUTIL_CONFIG_FILE:-}"

if [[ -z "$OSSUTIL_CONFIG_FILE" ]]; then
  OSSUTIL_CONFIG_FILE="$(make_ossutil_config_from_aliyun || true)"
fi

echo "[config] env file: ${ENV_FILE}"
echo "[config] oss target: ${OSS_DEST}"
if [[ -n "${ALIYUN_OSS_ENDPOINT:-}" ]]; then
  echo "[config] oss endpoint: ${ALIYUN_OSS_ENDPOINT}"
fi
if [[ -n "$CDN_REFRESH_DIRECTORY" ]]; then
  echo "[config] cdn refresh: ${CDN_REFRESH_DIRECTORY}"
else
  echo "[config] cdn refresh: skipped"
fi

if [[ $CHECK_ONLY -eq 1 ]]; then
  if [[ -z "$OSSUTIL_CONFIG_FILE" ]]; then
    echo "[error] Missing ossutil auth. Run `aliyun configure` once or set ALIYUN_OSSUTIL_CONFIG_FILE." >&2
    exit 1
  fi
  if [[ -n "$CDN_REFRESH_DIRECTORY" && -z "$ALIYUN_CLI_BIN" ]]; then
    echo "[warn] aliyun CLI is not installed, so CDN refresh will be skipped." >&2
    echo "[hint] Install guide: https://www.alibabacloud.com/help/en/cli/install-alibaba-cloud-cli" >&2
  fi
  echo "[ok] Deploy config looks usable."
  exit 0
fi

if [[ $SKIP_BUILD -eq 0 ]]; then
  echo "[build] npm run build"
  (cd "$ROOT_DIR" && npm run build)
fi

if [[ ! -d "$DIST_DIR" ]]; then
  echo "[error] Missing build output: $DIST_DIR" >&2
  exit 1
fi

OSS_SYNC_CMD=("$OSSUTIL_BIN" sync "$DIST_DIR/" "$OSS_DEST" -f --delete --update)
if [[ -n "$OSSUTIL_CONFIG_FILE" ]]; then
  OSS_SYNC_CMD+=(-c "$OSSUTIL_CONFIG_FILE")
fi
if [[ -n "${ALIYUN_OSS_ENDPOINT:-}" ]]; then
  OSS_SYNC_CMD+=(--endpoint "${ALIYUN_OSS_ENDPOINT}")
fi

echo "[upload] ${OSS_SYNC_CMD[*]}"
"${OSS_SYNC_CMD[@]}"

if [[ -n "$CDN_REFRESH_DIRECTORY" ]]; then
  if [[ -z "$ALIYUN_CLI_BIN" ]]; then
    echo "[warn] aliyun CLI not found, skip CDN refresh." >&2
    echo "[hint] Install guide: https://www.alibabacloud.com/help/en/cli/install-alibaba-cloud-cli" >&2
  else
    CDN_REFRESH_CMD=(
      "$ALIYUN_CLI_BIN"
      cdn
      RefreshObjectCaches
      --ObjectType Directory
      --ObjectPath "$CDN_REFRESH_DIRECTORY"
    )

    if [[ "$REFRESH_FORCE" == "true" ]]; then
      CDN_REFRESH_CMD+=(--Force true)
    fi

    echo "[refresh] ${CDN_REFRESH_CMD[*]}"
    "${CDN_REFRESH_CMD[@]}"
  fi
fi

echo "[done] Static site deployed to ${OSS_DEST}"
if [[ -n "$SITE_URL" ]]; then
  echo "[site] ${SITE_URL}"
fi
