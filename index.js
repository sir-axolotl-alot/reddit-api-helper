const axios = require('axios');
const dotenv = require('dotenv');
const readline = require('node:readline')

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

async function request_endpoint(path)
{
    var access_token = await get_access_token()
    var response = await fetch('https://oauth.reddit.com/' + path, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': userAgent,
        }
    });
    var json = await response.json()
    return json
}
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question(`Which endpoint to you want to call? \n >> https://oauth.reddit.com/`, async endpoint => {
    var api_response = await request_endpoint(endpoint)
    console.log('\nResponse:')
    console.log(api_response)
    rl.close();
});
