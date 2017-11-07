#!/bin/bash
set -e

analytics_file="../bin/vendor/analytics.html"
layout_file="$(dirname $0)/../../views/layout.pug"

# Replace analytics script in layout
distro=`uname`
if [[ $distro != 'Linux' ]]; then
  sed -i '' 's,'"<!--ANALYTICS-->,include $analytics_file"',g' "$layout_file"
else  # If running on macOS, the sed command has different syntax
  sed -i 's,'"<!--ANALYTICS-->,include $analytics_file"',g' "$layout_file"
fi
