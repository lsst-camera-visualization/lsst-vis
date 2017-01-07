#!/bin/bash

print_usage() {
  echo "Usage:"
  echo -e "\t./inc [-X or -Y or -Z]"
  echo ""
  echo "Example:"
  echo -e "\t./inc -Y"
}


if [[ ( $1 == "--help") ||  $1 == "-h"  || $# -ne 1 ]]
then
	print_usage
	exit 1
fi



if [ $1 == "-X" ] 
  then
    INC=0
elif [ $1 == '-Y' ] 
  then
    INC=1
elif [ $1 == '-Z' ] 
  then
    INC=2
else
  echo "Please enter a valid increment flag"
  print_usage
  exit 1
fi

old_version=$(sed '1q;d' version)

IFS='.' read -ra OV <<< $old_version
OV[$INC]=$(expr ${OV[$INC]} + 1)


new_version=""
for i in {0..2}; do
  new_version=$new_version${OV[$i]}"."
done
new_version=$new_version$(git rev-parse HEAD)

echo $new_version
echo $new_version > version
