const axios = require('axios');
const qs = require('querystring');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Assuming you have a User model


const authController = {

  // OAuth login - Redirect to Discord OAuth page
  login: (req, res) => {
    console.log('Starting OAuth login process...');
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const scope = 'identify email';
    const responseType = 'code';

    if (!redirectUri || !clientId) {
      console.error('Missing required environment variables for OAuth login');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;
    console.log("Redirecting user to Discord OAuth page:", oauthUrl); // Log OAuth redirect
    res.redirect(oauthUrl);  // Redirect the user to Discord for login
  },

  // OAuth callback - Get user info from Discord, issue a JWT token, and store in session
  callback: async (req, res) => {
    console.log('Starting OAuth callback process...');
    const code = req.query.code;
    if (!code) {
      console.error("No code provided in the callback request.");
      return res.status(400).json({ error: 'No code provided' });
    }

    console.log("Received authorization code:", code); // Log the authorization code

    try {
      console.log('Attempting to exchange code for access token...');
      // Step 1: Exchange the code for an access token from Discord
      const tokenResponse = await axios.post(
        'https://discord.com/api/oauth2/token',
        qs.stringify({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.DISCORD_REDIRECT_URI,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token } = tokenResponse.data;
      console.log("Access token received from Discord:", access_token); // Log the access token

      console.log('Fetching user data from Discord API...');
      // Step 2: Fetch user info from Discord
      const userResponse = await axios.get('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const userData = userResponse.data;
      console.log("User data fetched from Discord:", userData); // Log the user data

      console.log('Checking if user exists in database...');
      // Step 3: Check if user exists in DB, otherwise create a new user
      let user = await User.findOne({ discordId: userData.id });
      if (!user) {
        console.log('Creating new user in database...');
        user = new User({
          discordId: userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
        });
        await user.save();
        console.log("New user created in the database:", user);
      } else {
        console.log("Existing user found in database:", user);
      }

      console.log('Generating JWT token...');
      // Step 4: Generate JWT token for the user
      const token = jwt.sign(
        { discordId: user.discordId, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      console.log("JWT token generated for user:", token); // Log the generated JWT token

      // Step 5: Store the token in the session (for persistence)
      req.session.token = token;
      console.log("Session token stored successfully:", req.session.token); // Log the session token

      // Step 6: Redirect to frontend with token
      console.log("Redirecting to frontend with token...");
 // Update the redirect URL to include both token and user info
 const redirectUrl = new URL(process.env.FRONTEND_URL);
 redirectUrl.searchParams.append('token', token);
 redirectUrl.searchParams.append('username', user.username);
 redirectUrl.searchParams.append('avatar', user.avatar || '');
 
 console.log("Redirecting to frontend with token and user info...");
 res.redirect(redirectUrl.toString());

    } catch (error) {
      console.error("OAuth callback error details:", error.message);
      console.error("Full error stack:", error.stack);
      if (error.response) {
        console.error("API Error Response:", error.response.data);
        console.error("API Error Status:", error.response.status);
      }
      res.status(500).json({ error: 'Internal server error during OAuth process' });
    }
  }
};

module.exports = authController;
