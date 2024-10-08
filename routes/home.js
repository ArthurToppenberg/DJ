var express = require('express');
var router = express.Router();
var playlist_db = require('../src/playlist_db');
var song_search = require('../src/song_search');
var songs_db = require('../src/songs_db');
var downloader = require('../src/downloader');
var playlist_output = require('../src/playlist_output');

/* GET home page. */
router.get('/', function(req, res, next) {
    const user_id = req.session.user_id;
    playlist_db.get_playlist_belonging_to_id(user_id).then((playlists) => {
        //only return playlist name and id
        var playlists_data = [];
        playlists.forEach(playlist => {
            playlists_data.push({
                name: playlist.name,
                id: playlist.id
            });
        });
        res.render('home', { title: 'DJ PLAYLIST', playlists: playlists_data });
    });

});

router.post('/create_new_playlist', function(req, res, next) {
    const user_id = req.session.user_id;
    const playlist_name = 'New Playlist';

    if (playlist_name != undefined){
        playlist_db.create_playlist(user_id, playlist_name) // hande promise
        .then((playlist) => {
            give_playlist_url(playlist);
            res.json({success: true});
        })
        .catch((err) => {
            res.json({success: false, message: err.message});
        });
    }
    //create error
    else {
        res.json({success: false, message: "Playlist name not defined"});
    }
});

/*
    This route is called when the user clicks on a playlist
    Dynamicaly create url for each playlist with playlist id
    Example: /home/playlist/1
*/

playlist_db.get_playlists().then((playlists) => {
    playlists.forEach(playlist => {
        give_playlist_url(playlist);
    });
});

function give_playlist_url(playlist){
    /*
        Sends playlist data to the client if permission is granted
    */
    router.post('/playlist/' + playlist.id, function(req, res, next) {
        
        //update playlist
        playlist_db.get_playlist(playlist.id).then((playlist) => {
            //playlist is public (anyone can read it)
            if (playlist.public == 1){
                send_playlist_data(res, playlist);
            } 

            //playlist is private (only owner can read it)
            else {
                const user_id = req.session.user_id;
                if (user_id == playlist.user_id){
                    send_playlist_data(res, playlist);
                } else {
                    res.json({success: false, message: "You are not the owner of this playlist"});
                }
            }

            function send_playlist_data(res, playlist){
                res.json({success: true, playlist: playlist});
            }
        })
        .catch((err) => {
            res.json({success: false, message: 'playlist does not exist'});
        });
    });

    /*
        if permisions granted take input data and update playlist
    */

    router.post('/playlist/' + playlist.id + '/update', function(req, res, next) {

        const user_id = req.session.user_id;
        //check permision
        if (!playlist.public && user_id != playlist.user_id){
            res.json({success: false, message: "You are not the owner of this playlist"});
            return;
        }

        /* 
            create varables for all possible input data, which the user can change from the client
            if the user does not change a value, the value will be unchanged
            if undefined set to null
        */
        const name = req.body.name || null;
        const public = req.body.public || null;
        //if public is not null, 1 or 2, set to 1
        if (public != null && public != 1 && public != 2){
            public = 1;
        }
        const description = req.body.description || null;

        playlist_db.update_playlist(playlist.id, {name: name, public: public, description: description})
        .then((playlist) => {
            res.json({success: true, playlist: playlist});
        })
        .catch((err) => {
            res.json({success: false, message: err.message});
        });
    });

    router.post('/playlist/' + playlist.id + '/delete', function(req, res, next) {
        const user_id = req.session.user_id;
        //check permision
        if (!playlist.public && user_id != playlist.user_id){
            res.json({success: false, message: "You are not the owner of this playlist"});
            return;
        }

        playlist_db.delete_playlist(playlist.id)
        .then(() => {
            res.json({success: true});
        })
        .catch((err) => {
            res.json({success: false, message: err.message});
        });
    });

    router.post('/playlist/' + playlist.id + '/add_song', function(req, res, next) {
        const user_id = req.session.user_id;
        //check permision
        if (!playlist.public && user_id != playlist.user_id){
            res.json({success: false, message: "You are not the owner of this playlist"});
            return;
        }

        const id = req.body.id;

        if (id == undefined){
            res.json({success: false, message: "Missing song data"});
            return;
        }

        playlist_db.add_song(id, playlist.id).then((song_id) => {
            //get song data from id
            songs_db.get_song(song_id).then((song) => {
                give_song_url(song);
                res.json({success: true});
            })
            .catch((err) => {
                res.json({success: false, message: 'error getting song data'});
            });
        })
        .catch((err) => {
            res.json({success: false, message: err.message});
        });
    });

    router.post('/playlist/' + playlist.id + '/remove_song', function(req, res, next) {
        const user_id = req.session.user_id;
        //check permision
        if (!playlist.public && user_id != playlist.user_id){
            res.json({success: false, message: "You are not the owner of this playlist"});
            return;
        }

        const id = req.body.id;

        if (id == undefined){
            res.json({success: false, message: "Missing song data"});
            return;
        }

        playlist_db.remove_song(id, playlist.id).then(() => {
            res.json({success: true});
        })
        .catch((err) => {
            res.json({success: false, message: err.message});
        });
    });

    //zip playlist and download on client
    router.post('/playlist/' + playlist.id + '/download_zip', function(req, res, next) {
        const user_id = req.session.user_id;
        //check permision
        if (!playlist.public && user_id != playlist.user_id){
            res.json({success: false, message: "You are not the owner of this playlist"});
            return;
        }

        var avaliable_songs = [];

        playlist_db.get_playlist(playlist.id).then((playlist) => {
            var songs_ids = playlist.songs_ids;
            songs_ids = JSON.parse(songs_ids);
            
            songs_ids.forEach((song_id, index) => {
                songs_db.get_song(song_id).then((song) => {
                    if(song.file_path != null){
                        //song title max 50 chars
                        var title = song.youtube_title;
                        
                        if (title.length > 50){
                            title = title.substring(0, 50);
                        }

                        avaliable_songs.push([song.file_path, title]);
                    }

                    if(index == songs_ids.length - 1){
                        //zip playlist
                        playlist_output.zip(avaliable_songs).then((zip_path) => {                            
                            res.json({success: true, zip_file_path: 'playlists/' + zip_path, zip_file_name: playlist.name});
                        }).catch((err) => {
                            console.log(err);
                        });
                    }
                }).catch();
            });
        }).catch((err) => {
            res.json({success: false, message: 'error getting playlist data'});
        });
    });
}

//get all songs and great url for each song
songs_db.get_songs().then((songs) => {
    songs.forEach(song => {
        give_song_url(song);
    });
}).catch((err) => {
    console.log(err);
    console.log('error getting songs from songs_db');
});

function give_song_url(song){

    //download song
    downloader.download_song(song.youtube_id, song.id).catch((err) => {
        console.log('error downloading song: ' + song.youtube_id);
    });

    //check if router.post is not already created
    if (router.stack.find((r) => r.route.path == '/song/' + song.id)){
        return;
    }
    router.post('/song/' + song.id, function(req, res, next) {
       //get song data with song.id
        songs_db.get_song(song.id).then((song) => {
            if(song.file_path == null){
                song.file_path = false;
            }else{
                song.file_path = true;
            }
            res.json({success: true, song: song});
        }).catch((err) => {
            res.json({success: false, message: 'error getting song data'});
        });
    });
}

router.post('/songs/search', function(req, res, next) {
    const search_query = req.body.search_query;

    if (search_query != undefined){
        song_search.search(search_query)
        .then((songs) => {
            res.json({success: true, results: songs.results}); // send to client
        })
        .catch((err) => {
            res.json({success: false, message: err.message}); // error in song_search.js
        });
    }else{
        res.json({success: false, message: "Search query not defined"});
    }
});

module.exports = router;