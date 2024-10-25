# data-api-helper-scripts

## call_data_api.js
This script is useful to test arbitrary calls to the data API.
Provided that credentials (username, password, cliend ID and secret) are stored in the .env file, the script will ask which endpoint to access and bring back the results

Example:
```bash
$ node call_data_api.js
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

## save_subreddit_ids.js
This script is useful when we need to batch get subreddit IDs. It expects a text file with one subreddit name by line, and outputs a csv file with the subreddits IDs.

Example:
```bash
$ node save_subreddit_ids.js names.txt
```

Input - `names.txt`
```txt
aww
cats
crochet
news
AITAH
```

Output - `names.csv`
```csv
Subreddit,ID
aww,t5_2qh1o
cats,t5_2qhta
crochet,t5_2qm6c
news,t5_2qh3l
AITAH,t5_446kys
```
