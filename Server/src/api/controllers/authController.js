const User = require("../../models/User");
const { generateToken } = require("../../utils/jwt");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: "postmessage",
});

async function guest(req, res) {
    try {
        const user = await User.createGuest();
        const token = generateToken(user);
        res.status(200).json({ user, token });
    } catch (err) {
        console.log(err.message);
        res.status(401).json({ error: err.message });
    }
}

async function getCountryFromIP(ip) {
    try {
        const response = await axios.get(`https://ipapi.co/${ip}/country/`);
        return response.data;
    } catch (error) {
        console.log("Error detecting country:", error.message);
        return "Unknown"; // fallback
    }
}

// Helper function to get client IP
function getClientIP(req) {
    return (
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.headers["x-real-ip"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        req.ip
    );
}

async function register(req, res) {
    const userData = req.body;

    try {
        const clientIP = getClientIP(req);
        console.log(clientIP);
        if (!userData.country) {
            userData.country = await getCountryFromIP(clientIP);
            console.log(userData.country);
        }
        const user = await User.register(userData);
        const token = generateToken(user);
        res.status(200).json({ user, token });
    } catch (err) {
        console.log(err.message);
        res.status(401).json({ error: err.message });
    }
}

async function login(req, res) {
    const { username, password } = req.body;

    try {
        const user = await User.login(username, password);
        const token = generateToken(user);
        res.status(200).json({ user, token });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

async function google(req, res) {
    const { token: authCode } = req.body;

    try {
        const { tokens } = await client.getToken(authCode);
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email } = payload;

        const user = await User.loginWithGoogle(googleId, email);

        const jwt = generateToken(user);

        res.status(200).json({ user, token: jwt });
    } catch (err) {
        console.error(
            "Google login error (full):",
            err.response?.data || err.message || err
        );
        res.status(401).json({ error: "Google authentication failed" });
    }
}

function logout(req, res) {
    try {
        const { username } = req.body;

        if (username && username.startsWith("GUEST_")) {
            console.log(`Guest ${username} logged out`);
        } else if (username) {
            console.log(`User ${username} logged out`);
        } else {
            console.log(`Unknown user tried to logout`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

function disconnect(req, res) {
    try {
        const { username } = req.body;

        if (username && username.startsWith("GUEST_")) {
            console.log(`Guest user ${username} disconnected`);
        } else if (username) {
            console.log(`User ${username} disconnected`);
        } else {
            console.log(`Unknown user tried to disconnect`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    guest,
    register,
    login,
    google,
    logout,
    disconnect,
};
