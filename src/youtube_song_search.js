//search for song on youtube given a keyword

var youtube = require('youtube-search');
var opts = {
    maxResults: 10,
    key: 'AIzaSyA84jrSKbXJeU-bzPcGnjwySo-ZaE7mqPI'
};

youtube('The Weeknd - Blinding Lights', opts, function(err, results) {
    if(err) return console.log(err);
    console.dir(results);
});

