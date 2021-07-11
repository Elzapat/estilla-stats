const error =  {
    WRONG_USERNAME: 1,
};
// Variable to keep track if wether or not the user has fetched a stat
var has_fetched_stat = false;

document.getElementById("stat-info-form").onsubmit = () => {
    console.log("test");
    get_stat();
    return false;
};

document.getElementById("get-stat").addEventListener("submit", () => console.log("submit"));
console.log(document.getElementById("get-stat"));

async function get_stat() {
    initiate_loading();

    let username_input = document.getElementById("username");
    let stat_type_input = document.getElementById("stat-type");
    let stat_name_input = document.getElementById("stat-name");
    let username = "all", stat_type, stat_name, uuid = "all";
    let fetch_all = true;

    if (username_input.value != "") {
        fetch_all = false;
        username = username_input.value;
    }

    stat_type = stat_type_input.value;
    stat_name = stat_name_input.value;

    if (!fetch_all) {
        let player = await get_player_info(username);
        uuid = player.id;
        username = player.name;
    }
};

function initiate_loading() {
    if (!has_fetched_stat) {
        let desc_container = document.getElementById("description");
        desc_container.style.transform = "translateX(-100vw)";
    } else {

    }

    const LOADING_HTML = "<img id='loading-icon' src='images/estillacraft_logo_transparent_cropped.png' />";
    setTimeout(() => {
        document.getElementById("main").innerHTML = LOADING_HTML;
    }, 500);
}

async function get_player_info(username) {
    let request = `https://api.mojang.com/users/profiles/minecraft/${username}`;
    return await fetch(request)
        .then(response => {
            if (response.status == 204)
                throw new Error(error.WRONG_USERNAME);

            return response.json();
        });
}

function error_message(error_type) {
    switch (error_type) {
        case error.WRONG_USERNAME:
            return "The username you entered doesn't exist";        
    }
}
