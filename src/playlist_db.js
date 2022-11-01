const db = require('./db').connect();

//create playlist table
db.serialize(function() {
    /*
        link to user
        name
        date created
        date modified
        public
        description
    */

    const sql = `CREATE TABLE IF NOT EXISTS playlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL DEFAULT 'New Playlist',
        date_created_year INTEGER NOT NULL,
        date_created_month INTEGER NOT NULL,
        date_created_day INTEGER NOT NULL,
        date_created_hour INTEGER NOT NULL,
        date_created_minute INTEGER NOT NULL,
        date_created_second INTEGER NOT NULL,
        date_modified_year INTEGER NOT NULL,
        date_modified_month INTEGER NOT NULL,
        date_modified_day INTEGER NOT NULL,
        date_modified_hour INTEGER NOT NULL,
        date_modified_minute INTEGER NOT NULL,
        date_modified_second INTEGER NOT NULL,
        public INTEGER NOT NULL DEFAULT 0,
        description TEXT DEFAULT 'NO DESCRIPTION' NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`;

    //drop table
    //db.run(`DROP TABLE playlist`);

    db.run(sql);
});

function create_playlist(user_id, name){
    const date = new Date();
    //created
    const date_created_year = date.getFullYear();
    const date_created_month = date.getMonth();
    const date_created_day = date.getDate();
    const date_created_hour = date.getHours();
    const date_created_minute = date.getMinutes();
    const date_created_second = date.getSeconds();
    //modified
    const date_modified_year = date.getFullYear();
    const date_modified_month = date.getMonth();
    const date_modified_day = date.getDate();
    const date_modified_hour = date.getHours();
    const date_modified_minute = date.getMinutes();
    const date_modified_second = date.getSeconds();

    /*
        link to user
        dates
    */
    
    return new Promise((resolve, reject) => {
        var sql = `INSERT INTO playlist 
            (user_id, 
                name, 
                date_created_year, 
                date_created_month, 
                date_created_day, 
                date_created_hour, 
                date_created_minute, 
                date_created_second,
                date_modified_year,
                date_modified_month,
                date_modified_day,
                date_modified_hour,
                date_modified_minute,
                date_modified_second
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
            db.run(sql,
                [
                    user_id,
                    name,
                    date_created_year,
                    date_created_month,
                    date_created_day,
                    date_created_hour,
                    date_created_minute,
                    date_created_second,
                    date_modified_year,
                    date_modified_month,
                    date_modified_day,
                    date_modified_hour,
                    date_modified_minute,
                    date_modified_second
                ], function(err) {
                if(err){
                    console.log(err);
                    reject(new Error('Playlist already exists'));
                }
                
                sql = 'SELECT * FROM playlist WHERE id = ?';
                db.get(sql, [this.lastID], function(err, row) {
                    if(err){
                        console.log(err);
                        reject(new Error('Error getting playlist'));
                    }
                    resolve(row);
                });
            }
        );
    });
};

function get_playlist_belonging_to_id(id){
    //select all from playlist where user_id = id
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM playlist WHERE user_id = ?`;
        db.all(sql, [id], function(err, rows) {
            if (err) {
                reject(err);
            }
            resolve(rows);
        }
    )});
};

function get_playlists(){
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM playlist`;
        db.all(sql, function(err, rows) {
            if (err) {
                reject(err);
            }
            resolve(rows);
        }
    )});
}

module.exports = {
    create_playlist: create_playlist,
    get_playlist_belonging_to_id: get_playlist_belonging_to_id,
    get_playlists: get_playlists
};