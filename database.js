const keys = require("./keys");
const pgPromise = require("pg-promise"); // pg-promise core library

const initOptions = {
  // global event notification;
  error(error, e) {
    if (e.cn) {
      // A connection-related error;
      //
      // Connections are reported back with the password hashed,
      // for safe errors logging, without exposing passwords.
      console.log("CN:", e.cn);
      console.log("EVENT:", error.message || error);
    }
  },
};

const pgp = pgPromise(initOptions);
const url = keys.database.database_url;
let pool;
if (url !== (undefined || null)) {
  pool = pgp(url);
  pool
    .connect()
    .then((obj) => {
      obj.done(); // success, release the connection;
    })
    .catch((error) => {
      console.log("ERROR", error.message || error);
    });
}

module.exports = { pool: pool };
