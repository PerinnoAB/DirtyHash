!/bin/bash
echo "Exporting environment variables.."
export GOOGLE_APPLICATION_CREDENTIALS="sa.json"
export PORT=8080
export LOG_DIR=logs
# export LOG_FORMAT=":remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms"

echo "Launching server with pm2.."
pm2 start npm -- start --name dirtyhash-server --watch
echo "Finished launching server."
