const db = require('./db').connect();

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

function get_song_id(youtube_id, youtube_title, youtube_description, youtube_thumbnail){
    /*
        function will return song id if song is in database
        if song is not in database, add song to database and return song id
    */

    return new Promise((resolve, reject) => {
        //check if song is in database
        db.get(`SELECT id FROM songs WHERE youtube_id = ?`, [youtube_id], (err, row) => {
            if (err){
                console.log(err);
                reject({succsess: false, error: 'Error getting song id'});
                return;
            }

            if (row != undefined){
                resolve(row);
                return;
            }

            console.log('song does not exist adding now');
            //add song to database
            db.run(`INSERT INTO songs (youtube_id, youtube_title, youtube_thumbnail, youtube_description) VALUES (?, ?, ?, ?)`, [youtube_id, youtube_title, youtube_thumbnail, youtube_description], function(err){
                if (err){
                    reject({succsess: false, error: 'Error addind song to songs database'});
                    return;
                }

                resolve(this.lastID);
            });
        });
    });
}

function show_all(){
    const sql = `SELECT * FROM songs`;
    db.all(sql, [], (err, rows) => {
        if (err){
            throw err;
        }
        
        rows.forEach((row) => {
            console.log(row);
        });
    });
}

show_all();

module.exports = {
    get_song_id: get_song_id
};