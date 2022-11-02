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

function add_tool_toggle(param_on_create, param_1_text, param_1_color, param_1_condition, param_2_text, param_2_color, param_2_condition, post_url, return_param){
    var toggle = param_on_create;
    var tool = document.createElement("div");
    tool.className = "home-div-item-content-options-input-div-toggle";
    if(toggle == param_1_condition){
        tool.style.backgroundColor = param_1_color;
        tool.innerHTML = param_1_text;
    } else {
        tool.style.backgroundColor = param_2_color;
        tool.innerHTML = param_2_text;
    }
    document.getElementById("tools_bar").appendChild(tool);

    //add event listener
    tool.addEventListener("click", function(){
        //post request
        var xhr = new XMLHttpRequest();
        xhr.open("POST", post_url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
            var response = JSON.parse(xhr.responseText);
            if(response.success){
                if(response[return_param] = param_2_condition){
                    tool.style.backgroundColor = param_2_color;
                    tool.innerHTML = param_2_text;
                } else if(response.public = param_1_condition){
                    tool.style.backgroundColor = param_1_color;
                    tool.innerHTML = param_1_text;
                }else {
                    tool.style.backgroundColor = 'orange';
                    tool.innerHTML = 'ERROR';
                }
            }
        }

        if(toggle == param_1_condition){
            toggle = param_2_condition;
        }else {
            toggle = param_1_condition;
        }

        var data = JSON.stringify({[return_param]: toggle});
        xhr.send(data);
    });
}