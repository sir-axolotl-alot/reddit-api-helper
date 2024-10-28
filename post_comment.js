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

async function post_comment(parent, text)
{
    var access_token = await get_access_token()
    var response = await fetch('https://oauth.reddit.com/api/comment', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': userAgent,
        }, 
        body: new URLSearchParams({
            'thing_id': parent,
            'text': text,
            'api_type': 'json'
        })
    });
    var json = await response.json()
    return json
}

const PARENT_COMMENT_ID = 't1_lu6tjf9'
const COMMENT_TEXT = 'Hello from API'

post_comment(PARENT_COMMENT_ID, COMMENT_TEXT)
    .then(json => console.log(json))
    .catch(err => console.error(err))