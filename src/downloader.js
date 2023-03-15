//youtube downloader
const ytdl = require('ytdl-core');

const exec = require('child_process').exec;

const fs = require('fs');
const path = require('path');
const songs_db = require('./songs_db');

const dir = '/songs';

//if songs dir does not exist create it
if (!fs.existsSync(path.join(__dirname, dir))){
    //console.log('Creating songs dir');
    fs.mkdirSync(path.join(__dirname, dir));
}

//download_songs();

/*
    -- FUNCTIONS -- 
*/

function download_songs(){
    get_songs().then((songs) => {
        songs.forEach((song) => {
            console.log(song.file_path);
            download_song(song.youtube_id, song.id).then((song_path) => {
                //console.log('Downloaded and converted --> ' + song_path);

            }).catch((err) => {
                console.log('error downloading song --> ' + song.youtube_title);
            });
        });
    }).catch((err) => {
        console.log(err);
    });
}

function get_songs(){
    return new Promise((resolve, reject) => {
        songs_db.get_songs().then((songs) => {
            resolve(songs);
        }).catch((err) => {
            reject(err);
        });
    });
}

function clean_up_webm_and_mp3(file_path_webm, file_path_mp3){
    return new Promise((resolve, reject) => {
        //delete webm file
        fs.unlink(file_path_webm, (err) => {
            fs.unlink(file_path_mp3, (err) => {
                resolve();
            });
        });
    });
}

function download_song(youtube_id, song_id){
    const file_path = path.join(__dirname, dir, youtube_id)
    const file_path_webm =  file_path + '.webm';
    const file_path_mp3 =  file_path + '.mp3';
    return new Promise((resolve, reject) => {
        
            //check if song is already downloaded
            if (!fs.existsSync(file_path_mp3) || fs.existsSync(file_path_webm)){ // webm file exists
                //clean up
                clean_up_webm_and_mp3(file_path_webm, file_path_mp3).then(() => {
                    ytdl.getInfo(youtube_id).then((info) => {
                        //webm
                        var format = ytdl.filterFormats(info.formats, 'audioonly')[0];

                        //download song
                        ytdl(youtube_id, {format: format}).pipe(fs.createWriteStream(file_path_webm)).on('finish', () => {
                            convert_webm_to_mp3(file_path_webm, file_path_mp3);
                        });
                    }).catch((err) => {
                        reject('Video is restricted');
                    });
                });
            }else{
                //console.log('Already downloaded --> ' + file_path_mp3);
                update_song_path_in_db(song_id, file_path_mp3).then(() => {
                    resolve(file_path_mp3);
                }).catch((err) => {
                    console.log(err);
                    reject(err);
                });
            }
            
            function convert_webm_to_mp3(file_path_webm, file_path_mp3){
                //convert webm to mp3
                exec('ffmpeg -i ' + file_path_webm + ' ' + file_path_mp3, (err, stdout, stderr) => {
                    if (err){
                        console.log(err);
                        reject({succsess: false, error: 'Error converting webm to mp3 (probaly because ffmpg is not installed on system)'});
                        return;
                    }
                    //delete webm file
                    fs.unlink(file_path_webm, (err) => {
                        if (err){
                            console.log(err);
                            reject({succsess: false, error: 'Error deleting webm file'});
                            return;
                        }
                    });
                    update_song_path_in_db(song_id, file_path_mp3).then(() => {
                        resolve(file_path_mp3);
                    }).catch((err) => {
                        reject(err);
                    });
                }); 
            };

            function update_song_path_in_db(song_id, file_path_mp3){
                return new Promise((resolve, reject) => {
                    songs_db.update_song_path(song_id, file_path_mp3).then(() => {
                        resolve();
                    }).catch((err) => {
                        reject(err);
                    });
                });
            }
    });
}

module.exports = {
    download_songs: download_songs,
    download_song: download_song
}