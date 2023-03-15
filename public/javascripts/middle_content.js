/*
    This file is responsible for the middle content of the page
    This content will display different html pages in the middle of the page depending on the url
*/

const view_playlist = document.getElementById("view_playlist");
const search_songs = document.getElementById("search_songs");
const search_playlist = document.getElementById("search_playlist");
const follow_playlist = document.getElementById("followed_playlists");

const middle_content = document.getElementById("middle_content");
middle_content.style.overflow = "scroll";
middle_content.style.height = window.innerHeight - 75 + "px";

/* 
    view playlist 
*/

view_playlist.addEventListener("click", function(){
    clear();
    select(view_playlist);

    //create navigation bar
    const navigation_bar = document.createElement("div");
    navigation_bar.className = "nav-bar-div";
    navigation_bar.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    middle_content.appendChild(navigation_bar);

    const songs_container = document.createElement("div");
    middle_content.appendChild(songs_container);

    get_playlist();

    function get_playlist(){
        //get selected playlist
        const playlists = document.getElementsByClassName("playlist");
        //from playlists find the selected playlist (the selected on has white text color with no opacity)
        for (let i = 0; i < playlists.length; i++){
            if(playlists[i].style.color == "rgb(255, 255, 255)"){
                const playlist_id = playlists[i].id;
                fetch_playlist(playlist_id);
                return
            }
        }

        //show message no playlist selected
        const message = document.createElement("h1");
        message.innerHTML = "No Playlist Selected";
        message.style.color = "white";
        message.style.textAlign = "center";
        message.style.marginTop = "50px";
        middle_content.appendChild(message);
        
        function fetch_playlist(id){
            id_num = id.split("_")[1];
            //fetch playlist
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/home/playlist/" + id_num, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send();
            xhr.onload = function(){
                const response = JSON.parse(xhr.responseText);
                if(response.success){
                    const playlist = response.playlist;
                    
                    //add playlist name to navigation bar
                    const playlist_title = document.createElement("h1");
                    playlist_title.innerHTML = playlist.name;
                    playlist_title.style.color = "white";
                    navigation_bar.appendChild(playlist_title);

                    const playlist_songs = JSON.parse(playlist.songs_ids);
                    playlist_songs.forEach((song) => {
                        const song_div = document.createElement("div");
                        song_div.className = "song-div";
                        song_div.id = "song_" + song.id;
                        songs_container.appendChild(song_div);

                        get_song(song, song_div);
                    });

                    function get_song(id, playlist_div_id){
                        //fetch song
                        const xhr = new XMLHttpRequest();
                        xhr.open("POST", "/home/song/" + id, true);
                        xhr.setRequestHeader("Content-Type", "application/json");
                        xhr.send();
                        xhr.onload = function(){
                            const response = JSON.parse(xhr.responseText);
                            if(response.success){
                                const song = response.song;

                                //add thumnail
                                const thumbnail = document.createElement("img");
                                thumbnail.src = song.youtube_thumbnail;
                                thumbnail.className = "song-div-thumbnail";
                                playlist_div_id.appendChild(thumbnail);

                                //add title
                                const song_title = document.createElement("p");
                                song_title.innerHTML = song.youtube_title;
                                song_title.className = 'song-div-title'
                                playlist_div_id.appendChild(song_title);

                                //add loading gif
                                const loading_gif = document.createElement("img");
                                loading_gif.src = "/images/loading.gif";
                                loading_gif.className = "song-div-loading-gif";
                                check_song_processed_status(id);
                                playlist_div_id.appendChild(loading_gif);

                                    //on hover show message
                                    loading_gif.addEventListener("mouseover", hover_over_gif);

                                    function hover_over_gif(){ //this function to show message on hover
                                        const message = document.createElement("div");
                                        message.className = "message";
                                        message.innerHTML = "Your song is being processed";
                                        playlist_div_id.appendChild(message);
                                        //move message div to position of loading gif
                                        message.style.left = loading_gif.offsetLeft - message.offsetWidth + "px";
                                        message.style.top = loading_gif.offsetTop + "px";

                                        //remove message after x milliseconds
                                        setTimeout(function(){
                                            message.remove();
                                        }, 900);
                                    };

                                function check_song_processed_status(id){
                                    //check if song is processed
                                    const xhr = new XMLHttpRequest();
                                    xhr.open("POST", "/home/song/" + id, true);
                                    xhr.setRequestHeader("Content-Type", "application/json");
                                    xhr.send();
                                    xhr.onload = function(){
                                        const response = JSON.parse(xhr.responseText);
                                        if(response.success){
                                            const song = response.song;
                                            if(song.file_path == true){
                                                //song is processed, change loading gif to green_check.png
                                                loading_gif.src = "/images/green_check.png";
                                                //remove event listener
                                                loading_gif.removeEventListener('mouseover', hover_over_gif);
                                            }
                                            else{
                                                //song is not processed, check again in 1 second
                                                setTimeout(function(){
                                                    check_song_processed_status(id);
                                                }, 1000);
                                            }
                                        }
                                    }
                                }

                                //add delete button
                                const delete_button = document.createElement("button");
                                delete_button.innerHTML = "remove";
                                delete_button.className = "song-div-delete-button";
                                playlist_div_id.appendChild(delete_button);

                                    delete_button.addEventListener("click", function(){
                                        //remove song from playlist
                                        const xhr = new XMLHttpRequest();
                                        xhr.open("POST", "/home/playlist/" + playlist.id + "/remove_song", true);
                                        xhr.setRequestHeader("Content-Type", "application/json");
                                        xhr.send(JSON.stringify({id: song.id}));
                                        xhr.onload = function(){
                                            const response = JSON.parse(xhr.responseText);
                                            if(response.success){
                                                //remove song from playlist
                                                playlist_div_id.remove();
                                            }else{
                                                alert("Error: " + response.message);
                                            }
                                        }
                                    });
                            }
                        }
                    }
                }else{
                    alert(response.message);
                }
            }
        }
    }

});

/*
    search songs
*/
search_songs.addEventListener("click", function(){
    clear();
    select(search_songs);

    //create search bar div
    const nav_bar_div = document.createElement("div");
    nav_bar_div.className = "nav-bar-div";
    middle_content.appendChild(nav_bar_div);

    //create search bar
    const search_bar = document.createElement("input");
    search_bar.className = "search-bar";
    search_bar.placeholder = "Search for songs";
    nav_bar_div.appendChild(search_bar);

    //create div for results
    const search_results_div = document.createElement("div");
    search_results_div.id = "search_results_div";
    middle_content.appendChild(search_results_div);

    //action listener for search bar 
    search_bar.addEventListener("keyup", function(event){
        if (event.keyCode === 13) {
            event.preventDefault();
            query_search_songs(search_bar);
        }
    });
});

function query_search_songs(search_bar){
    //post request to server
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/home/songs/search", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({search_query: search_bar.value}));
    const placeholder = search_bar.placeholder;
    const search_bar_value = search_bar.value;
    search_bar.style.backgroundColor = "rgba(255, 0, 0, 0.355)";
    search_bar.value = "";
    search_bar.placeholder = "Searching...";

    xhr.onload = function(){
        const response = JSON.parse(xhr.responseText);
        if (response.success){
            search_bar.style.backgroundColor = "";
            search_bar.placeholder = placeholder
            search_bar.className = "search-bar";

            clear();
            add_search_query_results(search_bar_value);

            //for each result
            response.results.forEach((result) => {
                add_search_query_result(result);
            });
        }
    }

    function add_search_query_results(search_query){
        const search_query_div = document.createElement("div");
        search_query_div.className = "search-results-for-div";
        search_query_div.innerHTML = "Search Results For: " + search_query;
        search_results_div.appendChild(search_query_div);
    }

    function add_search_query_result(result){
        const result_div = document.createElement("div");
        result_div.className = "search-result-div";
        result_div.draggable = true;

        const thumbnail = document.createElement("img");
        thumbnail.className = "search-result-thumbnail";
        thumbnail.src = result.thumbnail;
        result_div.appendChild(thumbnail);

        // title and description on top of each other
        const title_and_description_div = document.createElement("div");
        title_and_description_div.className = "search-result-title-and-description-div";
        result_div.appendChild(title_and_description_div);

            //title
            const title = document.createElement("p");
            title.className = "search-result-title";
            title.innerHTML = result.title;
            title_and_description_div.appendChild(title);

            //description
            const description = document.createElement("p");
            description.className = "search-result-description";
            description.innerHTML = result.description;
            title_and_description_div.appendChild(description);

        search_results_div.appendChild(result_div);

        //add event listener for drag and drop
        result_div.addEventListener("dragstart", function(event){
            event.dataTransfer.setData("video_id", result.id);
        });
    }

    function clear(){
        document.getElementById("search_results_div").innerHTML = "";
    }
}

/*
    search playlist
*/




/*
    global functions
*/
function clear(){
    middle_content.innerHTML = "";
    deselect_all();
}

function select(element){
    element.style.backgroundColor = 'white';
    element.style.color = 'black';
}

function deselect_all(){
    view_playlist.style.backgroundColor = '';
    view_playlist.style.color = '';
    search_songs.style.backgroundColor = '';
    search_songs.style.color = '';
    search_playlist.style.backgroundColor = '';
    search_playlist.style.color = '';
    follow_playlist.style.backgroundColor = '';
    follow_playlist.style.color = '';
}