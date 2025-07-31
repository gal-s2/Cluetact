const { verifyToken } = require("../../utils/jwt");

async function requireAuth(socket, next) {
    try {
        const token = socket?.handshake?.auth?.token;
        if (token) {
            const decoded = verifyToken(token);

            socket.user = decoded;
            next();
        } else {
            next(new Error("Authentication error: No token provided"));
        }
    } catch (err) {
        next(new Error(err.message || "Authentication error"));
    }
}

module.exports = requireAuth;
