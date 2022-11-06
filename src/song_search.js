//search for song on youtube given a keyword

var youtube = require('youtube-search');
const key = 'AIzaSyA84jrSKbXJeU-bzPcGnjwySo-ZaE7mqPI';

const opts_10 = {
    maxResults: 10,
    key: key
};

const opts_1 = {
    maxResults: 1,
    key: key
};

function search(query){
    const formatted_query = query + '';
    return new Promise((resolve, reject) => {
        youtube(formatted_query, opts_10, function(err, results) {
            if(err) reject({success: false, message: 'error searching for song'});
            resolve({success: true, results: format_results(results)});
        });
    });

    /*
        format results
        song
            thumbnail
            title
            description
            id
    */
}

function get_data(id){
    return new Promise((resolve, reject) => {
        const url = 'https://www.youtube.com/watch?v=' + id;
        youtube(url, opts_1, function(err, results) {
            if(err) reject({success: false, message: 'error searching for song'});
            const output = format_results(results);
            resolve({success: true, results: output});
        });
    });

};

function format_results(results){
    return results.map((result) => {
        return {
            thumbnail: result.thumbnails.default.url,
            title: result.title,
            description: result.description,
            id: result.id
        }
    });
}

module.exports = {
    search: search,
    get_data: get_data
}