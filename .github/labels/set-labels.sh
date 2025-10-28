#!/usr/bin/env bash
set -euo pipefail

FILE="${1:-labels.json}"

jq -c '.[]' "$FILE" | while read -r l; do
  name=$(echo "$l" | jq -r '.name')
  color=$(echo "$l" | jq -r '.color' | tr -d '#')
  desc=$(echo "$l" | jq -r '.description')
  ref=$(echo "$l" | jq -r 'if has("ref") and .ref != null then .ref else "" end')

  echo "$name" "$color" "$desc" "$ref"

  if [ -n "$ref" ]; then
    gh label edit "$ref" --name "$name" --color "$color" --description "$desc"
    continue
  fi

  gh label create "$name" --color "$color" --description "$desc"
done
