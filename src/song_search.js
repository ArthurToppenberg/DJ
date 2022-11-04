//search for song on youtube given a keyword

var youtube = require('youtube-search');
var opts = {
    maxResults: 10,
    key: 'AIzaSyA84jrSKbXJeU-bzPcGnjwySo-ZaE7mqPI'
};

function search(query){
    const formatted_query = query + '';
    return new Promise((resolve, reject) => {
        youtube(formatted_query, opts, function(err, results) {
            if(err) reject({success: false, message: 'error searching for song'});
            resolve({success: true, results: format_results(results)});
        });
    });

    /*
        format results
        song
            thumbnail
            title (url)
            description
    */

    function format_results(results){
        return results.map((result) => {
            return {
                thumbnail: result.thumbnails.default.url,
                title: result.title,
                description: result.description
            }
        });
    }
}

module.exports = {
    search: search
}