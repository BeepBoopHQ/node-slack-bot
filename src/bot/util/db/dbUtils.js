const mysql = require('mysql');

require('dotenv').load();

const dbConn = process.env.JAWSDB_URL;
console.log(dbConn);

let connection = mysql.createConnection(dbConn);

module.exports.testDb = (cb) => {
  connection.connect();

  let solution = null;

  connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
    if (err) throw err;

    solution = rows[0].solution;

    console.log('DB solution is:', solution);

    cb(solution);
    
  });

  connection.end();
}