const dotenv = require('dotenv');
const Twitter = require('twitter-lite');
const circleImage = require('./circleImage');

/**
 * Load the environment variables from the .env file
 */
dotenv.config();

async function main() {
    // Create an instance of the API client using the consumer keys for your app
    const client = new Twitter({
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token_key: process.env.ACCESS_TOKEN_KEY,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
    });

    // client.get("account/verify_credentials")
    const response = await client.getBearerToken();
    const twitter = new Twitter({
        bearer_token: response.access_token
    });

    //get followers
    let username = 'SamadiPour';
    let user = await getUser(username, twitter)
    let avatars = await getAvatars(username, twitter);

    avatars = [user, ...avatars]

    circleImage(avatars)

}

async function getUser(username, twitter) {
    let params = {
        screen_name: username,
        include_entities: false,
    };
    let res = (await twitter.get('users/lookup', params))[0];
    return [res.id_str, res.profile_image_url.replace('normal', '400x400'),]
}

async function getAvatars(username, twitter) {
    let params = {
        screen_name: username,
        count: 200,
        include_entities: false,
        skip_status: true,
        cursor: -1
    };
    console.log('Fetching followers');
    let avatars = []
    do {
        let res = await twitter.get('followers/list', params);
        let temp = (
            res['users'].map((user) => [
                user.id_str,
                user.profile_image_url.replace('normal', '400x400'),
            ])
        );
        // avatars = Object.assign(avatars, temp)
        avatars = [...avatars, ...temp]
        params['cursor'] = res['next_cursor_str']
    } while (params['cursor'] !== '0')

    return avatars.reverse();
}


// entry point
main();