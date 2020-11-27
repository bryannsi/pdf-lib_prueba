require('dotenv').config();

const keys = {
  database: {
    name: 'koktela',
    database_url: process.env.DATABASE_URL,
  },
};

module.exports = keys;
