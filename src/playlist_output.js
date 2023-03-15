const fs  = require('fs');
const JSZip = require('jszip');
const path = require('path');

const dir = '../public/playlists';

//if songs dir does not exist create it
if (!fs.existsSync(path.join(__dirname, dir))){
    //console.log('Creating songs dir');
    fs.mkdirSync(path.join(__dirname, dir));
}

function zip(songs_data){
    /*
        songs_data = [file_path, song_title], ...
        playlist_name should be the name of the zip file
    */

    return new Promise((resolve, reject) => {
        const zip = new JSZip();
        //generate unique name for zip file
        const zip_file_name = Date.now() + '.zip';
        const zip_file_path = path.join(__dirname, dir, zip_file_name);

        songs_data.forEach((song_data) => {
            zip.file(song_data[1] + '.mp3', fs.readFileSync(song_data[0]));
        });

        zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream(zip_file_path))
        .on('finish', function () {
            resolve(zip_file_name);
        });
    });
}

module.exports = {
    zip: zip
}