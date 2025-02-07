const axios = require('axios');
require('dotenv').config();

let cachedToken = null;
let tokenExpiration = null;

const getCachedToken = async () => {
    if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
        return cachedToken;
    }

    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });

        cachedToken = response.data.access_token;
        tokenExpiration = Date.now() + (response.data.expires_in * 1000);
        return cachedToken;
    } catch (error) {
        console.error('Error fetching Twitch token:', error);
        throw new Error('Failed to get Twitch access token');
    }
};

module.exports = { getCachedToken };
