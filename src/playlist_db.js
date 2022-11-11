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
        songs_ids TEXT DEFAULT '[]' NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (songs_ids) REFERENCES songs(id)
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
            songs_ids = IFNULL(?, songs_ids)
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
                data.songs_ids,
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
        });    
    });
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

function add_song(youtube_song_id, playlist_id){
    /* 
        first get song_id from songs_db (not youtube song id)
        then add song to playlist with song_id from songs_db
    */
    return new Promise((resolve, reject) => {
        songs_db.add_song(youtube_song_id).then((song_id) => {
            //get playlist songs
            get_playlist(playlist_id).then((playlist) => {
                //add song to playlist
                var songs_ids = JSON.parse(playlist.songs_ids);
                songs_ids.push(song_id);
                songs_ids = JSON.stringify(songs_ids);
                update_playlist(playlist_id, {songs_ids: songs_ids}).then((playlist) => {
                    resolve(song_id);
                }
            )}).catch((err) => {
                reject(err);
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

function remove_song(song_id, playlist_id){
    return new Promise((resolve, reject) => {
        //get playlist songs
        get_playlist(playlist_id).then((playlist) => {
            //remove song from playlist
            var songs_ids = JSON.parse(playlist.songs_ids);
            var index = songs_ids.indexOf(song_id);
            if(index > -1){
                songs_ids.splice(index, 1);
            }
            songs_ids = JSON.stringify(songs_ids);
            update_playlist(playlist_id, {songs_ids: songs_ids}).then((playlist) => {
                resolve(song_id);
            }

        )}).catch((err) => {
            reject(err);
        });
    });
}

/*
    debug
*/

function show_all(){
    const sql = `SELECT * FROM playlist`;
    db.all(sql, function(err, rows) {
        if (err) {
            console.log(err);
        }
        console.log(rows);
        console.log(rows[0].songs_ids);
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
    add_song: add_song,
    remove_song: remove_song
};