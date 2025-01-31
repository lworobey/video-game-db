const axios = require('axios');
require('dotenv').config();

let cachedToken = null;
let tokenExpiry = 0;

const getCachedToken = async () => {
    const currentTime = Math.floor(Date.now() / 1000);

    if (cachedToken && currentTime < tokenExpiry) {
        return cachedToken;
    }

    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });

        cachedToken = response.data.access_token;
        tokenExpiry = currentTime + response.data.expires_in;

        return cachedToken;
    } catch (error) {
        console.error('Error fetching Twitch token:', error);
        throw new Error('Failed to get Twitch access token');
    }
};

module.exports = { getCachedToken };
