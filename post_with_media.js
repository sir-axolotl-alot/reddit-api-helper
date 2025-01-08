const { Blob } = require('buffer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const XmlParser = require('fast-xml-parser');

//Get the environment variables from the .env file
dotenv.config();
const { username, password, clientId, secret } = process.env;
const userAgent = 'node-script by u/'+username

//
// Get access token from Reddit
// Uses DOCUMENTED Reddit API (api/v1/access_token)
//
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

//
// Prepare for uploading by creating an upload grant
// Uses UNDOCUMENTED Reddit API (api/media_asset.json)
//
async function get_upload_grant(file_path, mime_type)
{
    var access_token = await get_access_token()
    var response = await fetch('https://oauth.reddit.com/api/media/asset.json', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': userAgent,
        },
        body: new URLSearchParams({
            'filepath': file_path,
            'mimetype': mime_type,
        })
    });
    const json = await response.json();

    const uploadUrl = `https:${json.args.action}`;
    const fields = json.args.fields;
    const listenUrl = json.asset.websocket_url;
    
    return {uploadUrl, fields, listenUrl};
}

//
// Upload the media to the CDN
// Uses UNDOCUMENTED Reddit API (returned from api/media_asset.json)
//
async function upload_media(uploadUrl, fields, file, filename)
{
    const formData = new FormData();
    fields.forEach(element => {
        formData.append(element.name, element.value);
    });
    const extension = filename.split('.').pop();

    formData.append('file', file, filename);
    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    });
    const text = await response.text();
    try {
        const parser = new XmlParser.XMLParser();
        const xml = parser.parse(text);
        const encodedURL = xml.PostResponse.Location;
        if (!encodedURL) throw 'No URL returned';
        const imageURL = decodeURIComponent(encodedURL);
        const key = xml.PostResponse.Key;
        return {key, imageURL, embedUrl: `https://i.redd.it/${key}.${extension}`};
    }
    catch (e){
        console.error('CDN Response:', response)
        throw e
    }
}

//
// Convert Markdown text to Rich Text JSON
// Uses UNDOCUMENTED Reddit API (api/convert_rte_body_format)
//
async function convert_markdown_to_richtext(markdown)
{
    var access_token = await get_access_token()
    var response = await fetch('https://oauth.reddit.com/api/convert_rte_body_format', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': userAgent,
        }, 
        body: new URLSearchParams({
            'output_mode': 'rtjson',
            'markdown_text': markdown,
        })
    });
    var json = await response.json()
    return json
}

//
// Create a post with rich text json
// Uses DOCUMENTED Reddit API (api/submit)
//
async function create_post_with_media(subreddit, title, richtext_json)
{
    var access_token = await get_access_token()
    var response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': userAgent,
        }, 
        body: new URLSearchParams({
            'sr': subreddit,
            'richtext_json': JSON.stringify(richtext_json),
            'title': title,
            'kind': 'self',
            'resubmit': true,
            'sendreplies': true,
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

const utils = {
    generatePostText: function (upload_response) {
        var text = 'This post was created using the Reddit API.';
        text += '\n\n The image is below';
        text += `\n\n ![img](${upload_response.key})`;
        text += '\n\n and here is some more text';
        return text;
    },

    createFileBlob: function (fileName, mimeType) {
        const filePath = path.join(__dirname, fileName);
        const fileBuffer = fs.readFileSync(filePath);
        const file = new Blob([fileBuffer], { type: mimeType });
        return file;
    }
}

const fileName = 'reddit_logo.jpg';
const mimeType = 'image/jpeg';
const subreddit = 'r/my_test_subreddit';
const title = '(from API) Post with media';

(async () => {
    const file = utils.createFileBlob(fileName, mimeType);    

    // Uses undocumented Reddit API
    const upload_grant = await get_upload_grant(fileName, mimeType); 
    // Uses undocumented Reddit API
    const upload_response = await upload_media(upload_grant.uploadUrl, upload_grant.fields, file, fileName);

    var text = utils.generatePostText(upload_response);  

    // Uses undocumented Reddit API
    const richtext_json = await convert_markdown_to_richtext(text);
    // Uses documented Reddit API
    const submit_post_response = await create_post_with_media(subreddit, title, richtext_json.output);
    
    console.log(`Post successful! See your post at ${submit_post_response.json.data.url}`);
    
})();

