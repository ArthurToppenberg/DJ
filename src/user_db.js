const db = require('./db').connect();

//create users table
db.serialize(function() {
    const sql = `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
    )`;

    db.run(sql);
});

function add_user(username, password, role){
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
        db.run(sql, [username, password, role], function(err) {
            if (err.errno == 19) {
                reject(new Error('Username already exists'));
            }
            resolve(this.lastID);
        });
    });
}

function login(username, password){
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
        db.get(sql, [username, password], function(err, row) {
            if (err) {
                reject(err);
            }
            if(row === undefined){
                reject(new Error('Invalid username or password'));
            }else{
                resolve(row);
            }
            
        });
    });
}

module.exports = {
    add_user: add_user,
    login: login
};