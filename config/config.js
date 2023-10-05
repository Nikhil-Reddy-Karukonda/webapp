require('dotenv').config();

const config = {
  // Extract database configurations from environment variables
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIALECT,
    "port": parseInt(process.env.DB_PORT, 10)
  }
}

module.exports = config;