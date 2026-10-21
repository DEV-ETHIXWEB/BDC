#!/bin/zsh
# One full QA round against a running `npm run preview`.
#   npm run preview -- --port 4371 &
#   qa/run_round.sh 1
# Lived in a temp directory for a long time and kept being wiped mid-run, which silently truncated
# rounds. It belongs with the checks it runs.
export QA_BASE=${QA_BASE:-http://localhost:4371}
R=${1:-1}
OUT=${2:-$(mktemp -d)}
echo "═══════════ QA ROUND $R ═══════════"
printf "  %-22s " "astro check";     npx astro check 2>&1 | grep -E "^- [0-9]+ errors?" | head -1
printf "  %-22s " "eslint";          (npm run lint >/dev/null 2>&1 && echo "clean") || echo "FAIL"
printf "  %-22s " "static_qa";       python3 qa/static_qa.py 2>&1 | grep -cE "broken internal refs: 0|SEO/structure issues: 0|not real pages: \[\]" | xargs -I{} echo "{}/3 gates ok"
printf "  %-22s " "old_site_parity"; python3 qa/old_site_parity.py 2>&1 | tail -1
printf "  %-22s " "overlap";         python3 qa/overlap_detector.py 2>&1 | grep "unique findings"
printf "  %-22s " "responsive";      python3 qa/responsive_sweep.py "$OUT/r$R.json" 2>&1 | grep "^checks"
printf "  %-22s " "csp";             python3 qa/csp_test.py 2>&1 | grep -oE "violations=[0-9]+" | tr '\n' ' '; echo
printf "  %-22s " "quick_request";   python3 qa/quick_request_flow.py 2>&1 | grep -c "^PASS" | xargs -I{} echo "{}/12 PASS"
printf "  %-22s " "seo_audit";       python3 qa/seo_audit.py 2>&1 | tail -1
printf "  %-22s " "privacy";         python3 qa/privacy_check.py 2>&1 | grep -E "third-party" | head -1
