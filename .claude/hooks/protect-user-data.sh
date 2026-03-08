#!/bin/zsh
set -euo pipefail

for path in "$@"; do
  case "$path" in
    GOALS.md|BACKLOG.md|Tasks/*|Knowledge/*)
      print -u2 "Refusing automated mutation of canonical user data: $path"
      exit 2
      ;;
  esac
done
