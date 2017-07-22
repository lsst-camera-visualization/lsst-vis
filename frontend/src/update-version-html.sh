#!/usr/bin/env bash
VERSION_FILE="version.html"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


# Remove the last line
cd $DIR
sed -i '$d' $VERSION_FILE
# append latest tag
echo $(git describe --tags --long) >> $VERSION_FILE
