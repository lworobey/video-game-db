const axios = require('axios');
const qs = require('querystring');

const authController = {
     // Redirect to Discord's OAuth2 login page
     login: (req, res) => {
        const redirectUri = process.env.DISCORD_REDIRECT_URI;
        const clientId = process.env.DISCORD_CLIENT_ID;
        const scope = 'identify email'; // Scope to request user email and basic info
        const responseType = 'code'; // We'll use 'code' to request an authorization code
        const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

        res.redirect(oauthUrl); // Redirect the user to the OAuth page
    },

    // Handle OAuth callback and exchange code for access token
    callback: async (req, res) => {
        const code = req.query.code;
        if (!code) return res.status(400).json({ error: 'No code provided' });
    
        try {
            const tokenResponse = await axios.post(
                'https://discord.com/api/oauth2/token',
                qs.stringify({
                    client_id: process.env.DISCORD_CLIENT_ID,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: process.env.DISCORD_REDIRECT_URI
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
    
            const { access_token } = tokenResponse.data;
            const userResponse = await axios.get('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${access_token}` }
            });
    
            const userData = userResponse.data;
    
            // Check if user already exists in MongoDB
            let user = await User.findOne({ discordId: userData.id });
            if (!user) {
                user = new User({
                    discordId: userData.id,
                    username: userData.username,
                    email: userData.email || '',
                    avatar: userData.avatar
                });
                await user.save();
            }
    
            res.json({ message: 'Authentication successful', user });
    
        } catch (error) {
            console.error('OAuth callback error:', error.response?.data || error.message);
            res.status(500).json({ error: 'Failed to authenticate with Discord' });
        }
    }
};

module.exports = authController;