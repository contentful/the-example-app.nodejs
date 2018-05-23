#!/bin/bash
case $BRANCH_NAME in
     master)
     sh SBI/runtests.sh
     ;;
     develop)
     sh SBI/runtest.sh
     ;;
     qa)
     sh SBI/runtests.sh
     ;;
     *)
     if [ -z "$BRANCH_NAME" ]
     then
      echo "No branch name provided!"
     exit 1
     fi
      ;;
esac
