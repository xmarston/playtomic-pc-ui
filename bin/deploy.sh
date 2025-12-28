#!/bin/bash

set -e

# Install zip if not installed
if ! command -v zip &> /dev/null; then
    echo "zip not found, installing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y zip
    elif command -v yum &> /dev/null; then
        sudo yum install -y zip
    elif command -v brew &> /dev/null; then
        brew install zip
    else
        echo "Error: Could not install zip. Please install it manually."
        exit 1
    fi
fi

DESTINATION_PATH="$HOME/tmp/ppc-ui.zip"
CURRENT_DIRECTORY=$(pwd)
UNIX_PROJECT_DIRECTORY="/opt/playtomic-pc-ui"

# Directories to exclude from the zip
EXCLUDE_DIRS=(
    "tests"
    "playtomic-pc"
    "bin"
    ".vscode"
    ".pytest_cache"
    ".data"
    "Lib"
    "Scripts"
    "node_modules"
    ".next"
    ".git"
)

# Build exclude arguments for zip
EXCLUDE_ARGS=""
for dir in "${EXCLUDE_DIRS[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS -x '$dir/*'"
done

echo "Compressing selected files..."
rm -f "$DESTINATION_PATH"
eval "zip -r '$DESTINATION_PATH' . $EXCLUDE_ARGS"

echo "Cleaning up remote..."
ssh xmarston@raspberrypi "cd /tmp/ && rm -rf ppc-ui.zip ppc-ui"

echo "Copying zip to Raspberry Pi..."
scp "$DESTINATION_PATH" xmarston@raspberrypi:/tmp/

echo "Extracting on remote..."
ssh xmarston@raspberrypi "cd /tmp/ && unzip ppc-ui.zip -d ppc-ui"

echo "Syncing to project directory..."
ssh xmarston@raspberrypi "sudo rsync -a /tmp/ppc-ui/ $UNIX_PROJECT_DIRECTORY/"

echo "Uncommenting network configuration in docker-compose.yaml..."
ssh xmarston@raspberrypi "sudo sed -i 's/^# //' $UNIX_PROJECT_DIRECTORY/docker-compose.yaml"

echo "Updating API URL for production..."
ssh xmarston@raspberrypi "sudo sed -i 's|http://localhost:8000|https://ppc-api.xmarston.dev|g' $UNIX_PROJECT_DIRECTORY/.env"

echo "Switching to production POSTGRES_PASSWORD..."
# Comment out the dev password (line without #) and uncomment the production password (line with #)
ssh xmarston@raspberrypi "sudo sed -i '/^POSTGRES_PASSWORD=/s/^/# /' $UNIX_PROJECT_DIRECTORY/.env"
ssh xmarston@raspberrypi "sudo sed -i '/^# POSTGRES_PASSWORD=/s/^# //' $UNIX_PROJECT_DIRECTORY/.env"

echo "Rebuilding and restarting Docker containers..."
ssh xmarston@raspberrypi "cd $UNIX_PROJECT_DIRECTORY && docker compose build && docker compose down && docker compose up -d --remove-orphans"

echo "Deployment complete!"
