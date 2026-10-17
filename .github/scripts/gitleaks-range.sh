#!/usr/bin/env bash
# Skan sekretów we wszystkich commitach z flagą -m dla commitów scalających (NFR-SEC-005, NFR-SEC-006).
set -euo pipefail
gitleaks="${GITLEAKS:-gitleaks}"
root="$(git rev-parse --show-toplevel)"

if [ "${1:-}" = "--all" ]; then
  range="--all"
  echo "Skan sekretów: cała historia ($(git rev-list --all --count) commitów)"
else
  before="${1:?sha przed (albo --all)}"
  after="${2:?sha po}"
  git cat-file -e "$after^{commit}" 2>/dev/null || { echo "Brak commitu $after w historii" >&2; exit 2; }
  if [[ "$before" =~ ^0+$ ]] || ! git cat-file -e "$before^{commit}" 2>/dev/null; then
    range="$after"
    echo "Skan sekretów: cała historia do ${after:0:12} (nowa gałąź albo poprzedni stan spoza historii)"
  else
    range="$before..$after"
    echo "Skan sekretów: $(git rev-list --count "$range") commitów w zakresie ${before:0:12}..${after:0:12}"
  fi
fi
"$gitleaks" git "$root" --config "$root/.gitleaks.toml" --no-banner --redact --log-level warn --log-opts="-m $range"
