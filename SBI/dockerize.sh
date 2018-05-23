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
     *)
      [ -z "${BRANCH_NAME} ] && echo "Branch is null"
      exit 1
      ;;
esac
