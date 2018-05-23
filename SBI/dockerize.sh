#!/bin/bash -xe

TEMP_DIR="$(pwd)/tmp"
TEMP_FILE="SBI/service-manifest.txt"
[ -d $TEMP_DIR ] || mkdir -p $TEMP_DIR
FILES=$(git diff --name-only HEAD~1 HEAD)

echo $FILES > $TEMP_FILE

if [ -n "${TEMP_FILE}" ];then
  for I in $(cat "${TEMP_FILE}"|xargs -n1 basename)
 do
 file=$(find . -name $I)
   if [ -n "${file}" ]
   then
   echo "File \"${file}\" found,Copying to temp dir $TEMP_DIR!"
   cp -pr $file $TEMP_DIR
   elif [ -z "${file}" ];then
   echo "Could not find file \"$I\",As this file was deleted in last commit..Skipping!"
   fi
 done
else
echo "No Changes were done in last commit!"
fi
cd $TEMP_DIR
[ `ls -1|wc -l` -ge 1 ] &&  tar -zcvf /tmp/archive-name.tar.gz .  >> /dev/null
cd -
[ $? -eq 0 ] && cp -pr /tmp/archive-name.tar.gz .

#cat /dev/null > $TEMP_FILE
