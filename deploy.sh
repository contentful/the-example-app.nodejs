#!/bin/env bash
set -e

analytics_dir="lib/analytics.js"
layout_file="views/layout.pug"

if [[ "$ENV" == "production" ]]; then
  # Fetch working branch
  current_branch=$(git rev-parse --abbrev-ref HEAD)

  if [[ "$current_branch" != "master" ]]; then
    echo "This script requires to be run on 'master'"
    exit 1
  fi

  # Check if 'heroku/deploy' exists as a branch - if it exists we delete it
  git checkout heroku/deploy 2>&1 /dev/null
  if [[ $? -eq 0 ]]; then
    git checkout $current_branch
    git branch -D heroku/deploy
  fi

  # Create a separate branch from current master
  git checkout -b heroku/deploy origin/master

  # Fetch analytics script and wrap it
  analytics_script="<script>$(cat $analytics_dir)</script>"

  # Replace analytics script in layout
  distro=`uname`
  if [[ $distro != 'Linux' ]]; then
    sed -i '' 's,'"<!--ANALYTICS-->,""$analytics_script"',g' "$layout_file"
  else  # If running on macOS, the sed command has different syntax
    sed -i 's,'"<!--ANALYTICS-->,""$analytics_script"',g' "$layout_file"
  fi

  # Commit changes and deploy to Heroku's master
  git commit -am "Insert Analytics"
  git push heroku heroku/deploy:master

  # Navigate back to current branch and delete deployment specific branch
  git checkout "$current_branch"
  git branch -D heroku/deploy
fi
