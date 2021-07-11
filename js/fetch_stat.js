const error =  {
    WRONG_USERNAME: 1,
    NETWORK_ERROR: 2
};
// Variable to keep track if wether or not the user has fetched a stat
var has_fetched_stat = false;

document.getElementById("stat-info-form").onsubmit = () => {
    get_stat();
    return false;
};

async function get_stat() {
    console.log("test0");
    initiate_loading();

    console.log("test1");
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
    console.log("test2");

    fetch("https://api.estillacraft.net/stats?uuid=5a985b6eae1d4f6e952e0e8134551b8b&stat_type=minecraft:killed&stat_value=minecraft:creeper")
        .then(response => console.log(response));
};

function error_message(error_type) {
    switch (error_type) {
        case error.WRONG_USERNAME:
            return "The username you entered doesn't exist";        
        case error.NETWORK_ERROR:
            return "There was an error fetching data";
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function stop_loading() {
    let loading_icon = document.getElementById("loading-icon");
    loading_icon.style.opacity = 0;
    await sleep(300);
}

async function get_player_info(username) {
    let request = `https://api.mojang.com/users/profiles/minecraft/${username}`;
    return await fetch(request)
        .then(response => {
            if (response.status == 204)
                throw new Error(error.WRONG_USERNAME);
            else if (!response.ok)
                throw new Error(error.NETWORK_ERROR);

            return response.json();
        });
}
//
// async function get_stat(uuid, stat_type, stat_name) {
//     
// }
