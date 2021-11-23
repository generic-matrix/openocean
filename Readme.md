## Define the .env file inside the api folder

CLIENT_ID=
CLIENT_SECRECT=
MONGODB_URL=
USERS_COLLECTION=users
TOKEN_COLLECTION=tokens
DB_NAME=OpenOcean
SECRECT_PASSPHASE=
PUBLIC_ENDPOINT=http://localhost
PUBLIC_PORT=3000
TEST_ADDRESS=
TEST_GOOGLE_TOKEN=


## Run the test to test the solidity functions  :

truffle development

test --network ganache

migrate --network ganache 


## Run the test of functins  /api 

function-index.js using npm run function-test

api-test.js using npm run api-test

## Run the API 

node index.js
