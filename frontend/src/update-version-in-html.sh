#!/usr/bin/env bash
VERSION_FILE="version.html"


# Remove the last line
sed -ie '$d'
# append latest tag
echo $(git describe --tags --long) >> $VERSION_FILE
