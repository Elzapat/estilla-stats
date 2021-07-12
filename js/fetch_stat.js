// Load all the minecraft ids
let minecraft_ids = new Object;
fetch("minecraft_ids.json")
    .then(response => response.json())
    .then(ids => {
        minecraft_ids = ids;
        add_stat_name_suggestions();
    });

document.getElementById("stat-info-form").onsubmit = () => {
    get_stat();
    return false;
};

document.getElementById("stat-type").onchange = add_stat_name_suggestions;

document.getElementById("stat-name").oninput = event => {
    let datalist = event.target.list;

    for (let option of datalist.options) {
        if (event.target.value == option.value) {
            event.target.setCustomValidity("");
            return;
        }
    }

    event.target.setCustomValidity("Please select a value from the list");
}

function add_stat_name_suggestions() {
    let stat_type_input = document.getElementById("stat-type");
    let datalist = document.getElementById("stat-names");
    let type = new String();

    switch (stat_type_input.value) {
        case "minecraft:killed": case "minecraft:killed_by":
            type = "mob";
            break;
        case "minecraft:mined":
            type = "block";
            break;
        case "minecraft:broken": case "minecraft:dropped": case "minecraft:picked_up":
        case "minecraft:used": case "minecraft:crafted":
            type = "item";
            break;
        case "custom":
            type = "custom";
            break;
        default:
            return;
    }

    datalist.innerHTML = "";

    for (let thing of minecraft_ids) {
        if (thing.type.includes(type)) {
            let option = document.createElement("option");
            option.text = mc_id_to_human(thing.id);
            option.value = thing.id;
            datalist.appendChild(option);
        }
    }
}

async function get_stat() {
    initiate_loading();

    has_fetched_stat = true;

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
        let player = await get_player_info(username)
            .catch(e => display_error(e));

        uuid = player.id;
        username = player.name;
    }

    let stat = await fetch_stat(uuid, stat_type, stat_name)
        .catch(e => display_error(e));

    console.log(stat);
};

function mc_id_to_human(source) {
    source = source
        .replace(/minecraft:/g, "")
        .replace(/_/g, " ")

    let words = source.split(" ");
    for (let i = 0; i < words.length; i++)
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);

    return words.join(" ");
}

function human_to_mc_id(source) {

}


async function get_player_info(username) {
    let request = `https://api.mojang.com/users/profiles/minecraft/${username}`;
    return await fetch(request)
        .then(response => {
            console.log(response);
            if (response.status == 204)
                throw new Error(error.WRONG_USERNAME);
            else if (!response.ok)
                throw new Error(error.REQUEST_ERROR);

            return response.json();
        });
}

async function fetch_stat(uuid, stat_type, stat_name) {
    let request = `https://api.estillacraft.net/stats?uuid=${uuid}&stat_type=${stat_type}&stat_name=${stat_name}`;

    return fetch(request)
        .then(response => {
            if (!response.ok)
                throw new Error(error.REQUEST_ERROR);

            return response.json();
        });
}
