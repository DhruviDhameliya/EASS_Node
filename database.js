const mysql = require('mysql');

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "@EASS2022#TLS",
    database: "eass",
    multipleStatements:true,
    timezone: "Asia/Calcutta",
});

con.connect(function (err) {
    if (err) {
        console.log('Connection error message: ' + err.message);
        return;
    }
    console.log("Database is Connected Successfully");
});
module.exports = con;