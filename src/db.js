const sqlite3 = require('sqlite3').verbose();
const path = 'src/'
const db_name = 'dj_playlist.db'

//manager for creating and connecting to the database sql
function connect(){
    return new sqlite3.Database(path + db_name, (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

module.exports = {
    connect: connect
}