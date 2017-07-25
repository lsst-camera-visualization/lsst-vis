#!/usr/bin/env bash
VERSION_FILE="version.html"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

HTML_TAG="<link rel=\"stylesheet\" type=\"text/css\" href=\"css/txtstyle.css\">"

# Remove the last line
cd $DIR
echo $HTML_TAG > $VERSION_FILE
# append latest tag
echo $(git describe --tags --long) >> $VERSION_FILE
