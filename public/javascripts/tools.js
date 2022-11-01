/*
    This script is used to show tools in tools bar (right side)
*/

// Path: public/javascripts/tools.js

//clear tools bar
function clear_tools_bar(){
    document.getElementById("tools_bar").innerHTML = "";
}

function add_title(title_text){
    var title = document.createElement("div");
    title.className = "home-div-item-content-options-title";
    title.innerHTML = title_text;
    document.getElementById("tools_bar").appendChild(title);
}

function add_tool_toggle(text, color_1, color_2, post_url){
    var tool = document.createElement("div");
    tool.className = "home-div-item-content-options-input-div-toggle";
    tool.innerHTML = text;
    document.getElementById("tools_bar").appendChild(tool);
}