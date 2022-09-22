# Dirtyhash

DirtyHash is a service to defend against Web3 and Crypto frauds, phishing, ransomware, blackmailers and money laundering. With this you can analyze suspicious entities (wallet addresses, smart contracts, web3 and regular domains, NFTs, social media handles, bank accounts, etc.) to detect frauds and scams. You can report any scams and also share them with the community.

## Setup

For tthe DirtyHash server, set up the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of the Firebase service-account-file.json, where the database is maintained.

e.g.

```
export GOOGLE_APPLICATION_CREDENTIALS="sa.json"
export PORT=8080
export LOG_DIR=logs
export ML_SERVER="http://10.128.0.10:8081"
export LOG_FORMAT=":remote-addr :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] - :response-time ms"
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
pm2 start npm --name dh-server -- start
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

pm2 logs are in .pm2/logs directory

## Swagger interface

/api/docs
````
