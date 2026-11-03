#!/bin/sh
# Fills the commit into the version corner, then runs the server. The pages
# are prerendered at build time, before the merge commit exists, so they and
# the scripts carry a placeholder. WWW_VERSION is sha-<commit> on Carrel;
# anything else (a local run) reads dev.
set -eu
case "${WWW_VERSION:-}" in
  sha-*) commit=${WWW_VERSION#sha-} ;;
  *) commit=dev ;;
esac
case "$commit" in *[!0-9a-z]*) commit=dev ;; esac
grep -rlF __BUILD_SHA__ server.js .next 2>/dev/null |
  while IFS= read -r file; do
    sed -i "s/__BUILD_SHA__/$commit/g" "$file"
  done
exec "$@"
