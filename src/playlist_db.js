var songs_db = require('./songs_db');
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
        public INTEGER NOT NULL DEFAULT 1,
        description TEXT DEFAULT 'NO DESCRIPTION' NOT NULL,
        songs_id TEXT[] DEFAULT '{}' NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (songs_id) REFERENCES songs(id)
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

function get_playlist(id){
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM playlist WHERE id = ?`;
        db.get(sql, [id], function(err, row) {
            if (err) {
                reject(err);
            }
            resolve(row);
        }
    )});
}

function update_playlist(id, data){
    return new Promise((resolve, reject) => {

        //for each element in data, update the playlist
        const date = new Date();
        //modified
        const date_modified_year = date.getFullYear();
        const date_modified_month = date.getMonth();
        const date_modified_day = date.getDate();
        const date_modified_hour = date.getHours();
        const date_modified_minute = date.getMinutes();
        const date_modified_second = date.getSeconds();

        var sql = `UPDATE playlist SET
            name = IFNULL(?, name),
            date_modified_year = ?,
            date_modified_month = ?,
            date_modified_day = ?,
            date_modified_hour = ?,
            date_modified_minute = ?,
            date_modified_second = ?,
            public = IFNULL(?, public),
            description = IFNULL(?, description),
            IFNULL(array_append(songs_id, ?), songs_id)
            WHERE id = ?`;

        db.run(sql, 
            [ 
                data.name, 
                date_modified_year, 
                date_modified_month, 
                date_modified_day, 
                date_modified_hour, 
                date_modified_minute, 
                date_modified_second, 
                data.public, 
                data.description, 
                data.song_id,
                id 
            ], function(err) {
            if(err){
                console.log(err);
                reject(new Error('Error updating playlist'));
            }
            sql = 'SELECT * FROM playlist WHERE id = ?';
            db.get(sql, [id], function(err, row) {
                if(err){
                    console.log(err);
                    reject(new Error('Error getting playlist'));
                }
                resolve(row);
            });
        }
    )});
}

function delete_playlist(id){
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM playlist WHERE id = ?`;
        db.run(sql, [id], function(err) {
            if (err) {
                reject(err);
            }
            resolve();
        }
    )});
}

function link_song(playlist_id, youtube_id, youtube_title, youtube_description, youtube_thumbnail){
    /*
        link song to playlist
    */
    return new Promise((resolve, reject) => {
        songs_db.get_song_id(youtube_id, youtube_title, youtube_description, youtube_thumbnail).then((song_id) => {
            update_playlist(playlist_id, {song_id: song_id}).then((playlist) => {
                resolve(playlist);
            });
        }).catch((err) => {
            reject(err);
        }
    )});
}

function show_all(){
    const sql = `SELECT * FROM playlist`;
    db.all(sql, function(err, rows) {
        if (err) {
            console.log(err);
        }
        console.log(rows);
    }
)};

//show_all();

module.exports = {
    create_playlist: create_playlist,
    get_playlist_belonging_to_id: get_playlist_belonging_to_id,
    get_playlists: get_playlists,
    update_playlist: update_playlist,
    get_playlist: get_playlist,
    delete_playlist: delete_playlist,
    link_song: link_song,
};