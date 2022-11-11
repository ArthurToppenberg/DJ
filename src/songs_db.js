const db = require('./db').connect();
var song_search = require('../src/song_search');

//create users table
db.serialize(function() {
    const sql = `CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        youtube_id TEXT NOT NULL,
        youtube_title TEXT NOT NULL,
        youtube_thumbnail TEXT NOT NULL,
        youtube_description TEXT NOT NULL,
        file_path TEXT,
        UNIQUE(youtube_id)
    )`;

    //db.run(`DROP TABLE songs`);
    db.run(sql);
});

function add_song(youtube_id){
    /*
        function will return song id if song is in database
        if song is not in database, add song to database and return song id
    */

    return new Promise((resolve, reject) => {
        //get information on song
        song_search.get_data(youtube_id).then((song_data) => {
    
            song_data = song_data.results[0];

            //check if song is in database
            db.get(`SELECT id FROM songs WHERE youtube_id = ?`, [youtube_id], (err, row) => {
                if (err){
                    console.log(err);
                    reject({succsess: false, error: 'Error getting song id'});
                    return;
                }

                if (row != undefined){
                    resolve(row.id);
                    return;
                }

                //add song to database
                db.run(`INSERT INTO songs (youtube_id, youtube_title, youtube_thumbnail, youtube_description) VALUES (?, ?, ?, ?)`, [song_data.id, song_data.title, song_data.thumbnail, song_data.description], function(err){
                    if (err){
                        reject({succsess: false, error: 'Error addind song to songs database'});
                        return;
                    }
                    resolve(this.lastID);
                });
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

function get_songs(){
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM songs`, (err, rows) => {
            if (err){
                reject({succsess: false, error: 'Error getting all songs'});
                return;
            }

            resolve(rows);
        });
    });
}

function get_song(id){
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM songs WHERE id = ?`, [id], (err, row) => {
            if (err){
                reject({succsess: false, error: 'Error getting song'});
                return;
            }

            resolve(row);
        });
    });
};

function update_song(id, data){
    return new Promise((resolve, reject) => {
        var sql = `UPDATE songs SET `;
        var values = [];
        var first = true;
        for (var key in data){
            if (first){
                first = false;
            } else {
                sql += ', ';
            }
            sql += `${key} = ?`;
            values.push(data[key]);
        }
        sql += ` WHERE id = ?`;
        values.push(id);

        db.run(sql, values, function(err){
            if (err){
                reject({succsess: false, error: 'Error updating song'});
                return;
            }

            get_song(id).then((song) => {
                resolve(song);
            }).catch((err) => {
                reject(err);
            });
        });
    });
}

function show_all(){
    db.all(`SELECT * FROM songs`, (err, rows) => {
        if (err){
            console.log(err);
            return;
        }

        console.log(rows);
    });
}

//show_all();

module.exports = {
    add_song: add_song,
    get_songs: get_songs,
    get_song: get_song,
    update_song: update_song
};