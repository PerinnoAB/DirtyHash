# Dirtyhash

Dirtyhash app

## Setup

In order for the app to work remember to set up the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of the firebase service-account-file.json.

f.e.

```
export GOOGLE_APPLICATION_CREDENTIALS="sa.json"
```

Additional environment variables.

```
export PORT=8080
export LOG_DIR=logs
export LOG_FORMAT=":remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms"
```

## Installation

```
npm install  --legacy-peer-deps
```

## Running the app in dev environment

```
npm run dev
```

## Running the app in prod environment

```
npm run start
```

or with pm2

```
pm2 start npm -- start --name dirtyhash-server
```

pm2 restart with updating env variables

```
pm2 restart all --update-env
```

pm2 config

````
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 1G
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:rotateModule false
pm2 set pm2-logrotate:rotateInterval '0 0 1 * *'
```

## Swagger interface

/api-docs
````
