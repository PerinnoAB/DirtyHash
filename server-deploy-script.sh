#!/bin/bash
echo "Exporting environment variables.."
export GOOGLE_APPLICATION_CREDENTIALS="sa.json"
export PORT=8080
export LOG_DIR=logs

echo "Launching server with pm2.."
pm2 start npm -- start
echo "Finished launching server."
