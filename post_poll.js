const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const { username, password, clientId, secret } = process.env;
const userAgent = 'node-script by u/'+username

async function get_access_token()
{
    var response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${clientId}:${secret}`)
        },
        body: new URLSearchParams({
            'grant_type': 'password',
            'username': username,
            'password': password
        })
    });
    var json = await response.json()
    return json.access_token
}

async function create_poll(subreddit, title, text, options)
{
    var access_token = await get_access_token()
    var response = await fetch('https://oauth.reddit.com/api/submit_poll_post?raw_json=1', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': userAgent,
        }, 
        body: JSON.stringify({
            'sr': subreddit,
            'text': text,
            'options': options,
            'duration': 3,            
            'resubmit': true,
            'sendreplies': true,
            'title': title,
            'nsfw': false,
            'spoiler': false,
            'validate_on_submit': false, 
            'submit_type': 'subreddit',
            'api_type': 'json',
            'show_error_list':true,
            'post_to_twitter': false,
        })
    });
    var json = await response.json()
    return json
}

SUBREDDIT_NAME="r/axolotl_playground"
POLL_TITLE="Another Poll from API."
POLL_OPTIONS=["Cats", "Dogs", "Axolotls"]
POLL_TEXT="What is your favourite pet?"

create_poll(SUBREDDIT_NAME, POLL_TITLE, POLL_TEXT, POLL_OPTIONS)
    .then(json => console.log(JSON.stringify(json)))
    .catch(err => console.error(err))