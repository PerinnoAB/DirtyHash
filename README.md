<div align="center">
  <img src="https://dirtyhash.com/assets/img/dh_logo.png" height="100">
</div>

# [DirtyHash](https://dirtyhash.com)

[DirtyHash](https://dirtyhash.com) is a security project to defend against Web3 and Crypto frauds, phishing, ransomware, blackmailers and money laundering. With this you can analyze suspicious entities (wallet addresses, smart contracts, web3 and regular domains, NFTs, social media handles, bank accounts, etc.) to detect frauds and scams. You can report any scams and also share them with the community.

Read the [launch post here](https://medium.com/@amiacs/towards-a-safer-web3-defending-against-cryptoscams-with-dirtyhash-b0d08f1039e6).

## Setup

Clone the project and set up the machine (in the following instructions a Ubuntu server is assumed). You can easily install node and npm using nvm.

```
sudo apt-get install nodejs npm
sudo npm install pm2 -g
sudo apt-get install git-all
git clone https://github.com/PerinnoAB/DirtyHash.git
```

For the DirtyHash server, set up the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of the Firebase service-account-file.json, where the database is maintained.

e.g.

```
export GOOGLE_APPLICATION_CREDENTIALS="sa.json"
export PORT=8080
export LOG_DIR=logs
export ML_SERVER="http://10.128.0.10:8081"
export VT_URL='VT_URL'
export VT_API_KEY='VT_API_KEY'
export LOG_FORMAT=":remote-addr :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] - :response-time ms"
export SENDGRID_API_KEY = 'SENDGRID_API_KEY'
export SENDGRID_TEMPLATE_ID = 'SENDGRID_TEMPLATE_ID'
export REPORT_EMAIL = 'EMAIL_TO_RECEIVE_REPORT'
```

## Installation

```
npm install  --legacy-peer-deps
npm install --force
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
pm2 save
```

pm2 restart with updating env variables

```
pm2 restart all --update-env
```

pm2 config

```
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 1G
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:rotateModule false
pm2 set pm2-logrotate:rotateInterval '0 0 1 * *'
```

## License

[Apache License 2.0](LICENSE)
