#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ALIYUN_DEPLOY_ENV_FILE:-$ROOT_DIR/.deploy.aliyun.env}"
DIST_DIR="${ALIYUN_DIST_DIR:-$ROOT_DIR/dist}"

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
  3. Configure `ossutil` locally
  4. Configure `aliyun` CLI locally if you want CDN refresh
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

find_ossutil() {
  if [[ -n "${ALIYUN_OSSUTIL_BIN:-}" ]]; then
    echo "$ALIYUN_OSSUTIL_BIN"
    return
  fi

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

OSS_SYNC_CMD=("$OSSUTIL_BIN" sync "$DIST_DIR/" "$OSS_DEST" --delete --update)
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
