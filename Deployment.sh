#!/bin/bash -xe
cd $(dirname $0)
TEMP_PATH="$WORKSPACE/tmp"
[ -d $TEMP_PATH ] || mkdir -p $TEMP_PATH
FILES=$(git diff --name-only HEAD~1 HEAD)

if [ -n "${FILES}" ];then
for I in $(echo "${FILES}"|xargs -0 basename)
do
file=$(find $WORKSPACE/ -name $I)
if [ -n "${file}" ]
then 
sudo cp -pr $file $TEMP_PATH
cd $TEMP_PATH
sudo tar -zcvf /tmp/archive-name.tar.gz . --exclude="*.sh"
sudo tar -zxvf /tmp/archive-name.tar.gz -C /tmp/mytest
sudo chown -R subham:subham /tmp/mytest
else
echo "Could not find file \"$I\",Skipping deployment of file!"
fi
done
else
echo "No files to be deployed"
fi
echo $TEMP_PATH
sudo rm -rf $TEMP_PATH
sudo rm -rf /tmp/archive-name.tar.gz
