#!/usr/bin/env bash
# The image as deployed: serve the home page and fill the commit into the
# version corner. ci runs it with the image loaded as
# ghcr.io/nycu-winlab/www.winlab.tw:ci.
set -euo pipefail
trap 'docker compose logs' EXIT
# A negated test (! cmd) never trips set -e, so absence is checked here.
absent() { if grep -qF "$1"; then echo "unexpected $1 in $2" >&2; exit 1; fi; }

: > "$RUNNER_TEMP/www.env"
cat > .env <<ENV
WWW_VERSION=sha-abc1234
WWW_ENV_FILE=$RUNNER_TEMP/www.env
WWW_BIND=127.0.0.1
ENV
# compose would pull :sha-abc1234; run the ci image under that tag.
docker tag ghcr.io/nycu-winlab/www.winlab.tw:ci ghcr.io/nycu-winlab/www.winlab.tw:sha-abc1234
docker compose up -d --wait web

page=$(curl -sf localhost:3000/)
grep -q 'WinLab' <<<"$page"
grep -q '>abc1234<' <<<"$page"
absent __BUILD_SHA__ / <<<"$page"
for js in $(grep -o '/_next/static/[^"]*\.js' <<<"$page" | sort -u); do
  curl -sf "localhost:3000$js" | absent __BUILD_SHA__ "$js"
done
test "$(curl -s -o /dev/null -w '%{http_code}' localhost:3000/missing-page)" = 404
# The build read Keycloak: the home page lists the members. A fork's pull
# request builds without the secrets, so only a build that pushes checks.
if [ "${PUSH:-}" = true ]; then
  absent 'Member list is temporarily unavailable' / <<<"$page"
fi
echo "smoke passed"
