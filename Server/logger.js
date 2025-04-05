const winston = require('winston');
const { format, transports } = winston

const REQUESTS_LOG_FILE = './logs/requests.log';

const logFormat = format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const requestLogger = winston.createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: "DD-MM-YYYY HH:mm:ss.SSS" }),
        logFormat
    ),
    transports: [
      new transports.File({ filename: REQUESTS_LOG_FILE }),
      new transports.Console()
    ]
});

module.exports = {
    requestLogger,
}