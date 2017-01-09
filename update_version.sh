#!/bin/bash

# Updates the version file, to be used by the frontend browser code.

VERSION_FILE="version"

version=$(git describe --tags --long)

echo $version > $VERSION_FILE
