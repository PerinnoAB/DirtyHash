# Dirtyhash

Dirtyhash app

## Setup

In order for the app to work remember to set up the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of the service-account-file.json.

f.e.

```
export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"
```

the service-account-file.json. should look like this:

```
{
  "type": "service_account",
  "project_id": "PROJECT_ID",
  "private_key_id": "KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nPRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "SERVICE_ACCOUNT_EMAIL",
  "client_id": "CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/SERVICE_ACCOUNT_EMAIL"
}
```

and should never be updated in the repo, so in case you need it please ask the firebase admin to give you the access details.

Additional environment variables. 
PORT. 
LOGS_DIR. 

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
