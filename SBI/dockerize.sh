#!/bin/bash
BRANCH="$(echo $GIT_BRANCH|cut -d'/' -f2)"
case $BRANCH in
   master)
     sh SBI/runtest.sh
     ;;
   develop)
     sh SBI/runtest.sh
     ;;
   qa)
     sh SBI/runtest.sh
     ;;
   *)
     if [ -z "$BRANCH_NAME" ]
     then
      echo "No branch name provided!"
     exit 1
     fi
      ;;
esac
