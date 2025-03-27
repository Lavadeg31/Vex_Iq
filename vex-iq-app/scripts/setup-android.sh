#!/bin/bash

# Set Android SDK path
export ANDROID_HOME=/Users/larsini/Library/Android/sdk

# Add Android SDK tools to PATH
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Create local.properties if it doesn't exist
if [ ! -f "android/local.properties" ]; then
    echo "sdk.dir=$ANDROID_HOME" > android/local.properties
fi

echo "Android SDK setup complete!"
echo "ANDROID_HOME=$ANDROID_HOME" 