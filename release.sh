#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:?Usage: ./release.sh <version> (e.g. 0.2.0)}"
TAG="v${VERSION}"
ARTIFACT="korb-${VERSION}.tgz"

if git ls-remote --tags origin | grep -q "refs/tags/${TAG}$"; then
  echo "Error: tag ${TAG} already exists on remote"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Error: working tree is dirty. Commit or stash changes first."
  exit 1
fi

npm version --no-git-tag-version "${VERSION}"
npm ci
npm run build
npm pack --pack-destination .

mv korb-*.tgz "${ARTIFACT}" || true

git add package.json
if git diff --cached --quiet; then
  echo "No version changes to commit."
else
  git commit -m "Release ${TAG}"
fi

git push origin main

gh release create "${TAG}" "${ARTIFACT}" --title "${TAG}" --target main --generate-notes

echo "Done: ${TAG}"
