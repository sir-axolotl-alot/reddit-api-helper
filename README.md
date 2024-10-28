# reddit-api-helper

## usage

1. Create a [Reddit Developer Application](https://www.reddit.com/prefs/apps) with type **Personal Use Script**

2. Make a copy of `template.env`, rename it to just `.env` and fill it with the information:

   a) `username`: the Reddit username of the user who the app will make requests on behalf of

   b) `password`: the password of the user who the app will make requests on behalf of

   c) `clientId`: the application ID from Reddit Developer portal

   d) `secret`: the application secret from Reddit Developer portal

Then, in the app's folder, run
  
```
npm install
```

## index.js
This script is useful to test arbitrary calls to the data API.
Provided that credentials (username, password, cliend ID and secret) are stored in the .env file, the script will ask which endpoint to access and bring back the results

Example:
```bash
$ node index.js
Which endpoint to you want to call? 
 >> user/sir_axolotl_alot/comments

Response:
{
  kind: 'Listing',
  data: {
    after: null,
    dist: 3,
    modhash: null,
    geo_filter: '',
    children: [ [Object], [Object], [Object] ],
    before: null
  }
}
```


