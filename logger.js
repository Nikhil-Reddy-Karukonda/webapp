const { createLogger, transports, format } = require('winston');
const { combine, timestamp, printf } = format;

const customFormat = combine(timestamp(), printf((logObject) => {
    return `${logObject.timestamp} [${logObject.level.toUpperCase()}] - ${logObject.message}`
}));

const logger = createLogger({
  level: process.env.LOG_LEVEL,
  format: customFormat,
  transports: [
    // new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: '/var/log/webapp/webapp.log' }),
  ],
});

module.exports = logger;