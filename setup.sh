#!/bin/bash

# Check NPM local path
function set_local_npm_path {
    export PATH="$PATH:./node_modules/.bin"
    echo "export PATH=\"\$PATH:./node_modules/.bin\"" >> ~/.bashrc
}
echo "$PATH" | grep -q './node_modules/.bin' && echo "Local NPM path is set" || set_local_npm_path

# Check NPM global path
function set_global_npm_path {
    export PATH="$PATH:/usr/local/bin"
    echo "export PATH=\"\$PATH:/usr/local/bin\"" >> ~/.bashrc
}
echo "$PATH" | grep -q '/usr/local/bin' && echo "Global NPM path is set" || set_global_npm_path

# Check if brew is installed, otherwise install it
brew --version > /dev/null 2>&1
BREW_RET=$?
if [ $BREW_RET -ne 0 ]; then
    echo "BREW not found, installing:"
    ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"
else
    echo "BREW is already installed"
fi

# Check and install npm
npm --version > /dev/null 2>&1
NPM_RET=$?
if [ $NPM_RET -ne 0 ]; then
    echo "NPM not found, installing:"
    brew install npm
else
    echo "NPM is already installed"
fi

# Check and install bower
which bower > /dev/null 2>&1
BOWER_RET=$?
if [ $BOWER_RET -ne 0 ]; then
  echo "bower not found, installing:"
  npm install -g bower
else
  echo "bower is already installed"
fi

# Check and install grunt
which grunt > /dev/null 2>&1
GRUNT_RET=$?
if [ $GRUNT_RET -ne 0 ]; then
  echo "grunt not found, installing:"
  npm install -g grunt-cli
else
  echo "grunt is already installed"
fi

# Install dependecies
bundle install
npm install
bower install
