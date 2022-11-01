var express = require('express');
var router = express.Router();
var playlist_db = require('../src/playlist_db');

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
    const playlist_name = req.body.playlist_name;

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
    router.get('/playlist/' + playlist.id, function(req, res, next) {
        //playlist is public (anyone can read it)
        if (playlist.public == 1){
            send_playlist_data(playlist, res);
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
    });
}

module.exports = router;