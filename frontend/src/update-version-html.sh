#!/usr/bin/env bash
VERSION_FILE="version.html"


# Remove the last line
sed -i '$d' $VERSION_FILE
# append latest tag
echo $(git describe --tags --long) >> $VERSION_FILE
