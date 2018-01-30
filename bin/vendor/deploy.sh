#!/bin/bash
set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "production" ]]; then
  echo 'Aborting post deployment script';
  exit 0;
fi

analytics_file="../bin/vendor/analytics.html"
layout_file="$(dirname $0)/../../views/layout.pug"

# Replace analytics script in layout
distro=`uname`
if [[ $distro != 'Linux' ]]; then
  sed -i '' 's,'"<!--ANALYTICS-->,include $analytics_file"',g' "$layout_file"
else  # If running on macOS, the sed command has different syntax
  sed -i 's,'"<!--ANALYTICS-->,include $analytics_file"',g' "$layout_file"
fi
