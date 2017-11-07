#!/bin/bash
set -e

analytics_file="$(dirname $0)/analytics.js"
layout_file="$(dirname $0)/../../views/layout.pug"

# Fetch analytics script and wrap it
analytics_script="<script>$(cat $analytics_file)</script>"

# Replace analytics script in layout
distro=`uname`
if [[ $distro != 'Linux' ]]; then
  sed -i '' 's,'"<!--ANALYTICS-->,""$analytics_script"',g' "$layout_file"
else  # If running on macOS, the sed command has different syntax
  sed -i 's,'"<!--ANALYTICS-->,""$analytics_script"',g' "$layout_file"
fi
