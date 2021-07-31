// Load all the minecraft ids
let minecraft_ids = new Object;
fetch("minecraft_ids.json")
    .then(response => response.json())
    .then(ids => {
        minecraft_ids = ids;
        add_stat_name_suggestions();
    });

document.getElementById("stat-info-form").onsubmit = () => {
    if (stats_load_finished)
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
        case "minecraft:custom":
            type = "custom";
            break;
        default:
            return;
    }

    datalist.innerHTML = "";

    for (let thing of minecraft_ids) {
        if (thing.type.includes(type)) {
            let option = document.createElement("option");
            option.value = mc_id_to_human(thing.id);
            datalist.appendChild(option);
        }
    }
}

async function get_stat() {
    stats_loading_finished = false;

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
    stat_name = human_to_mc_id(stat_name_input.value);

    if (!fetch_all) {
        let player = await get_player_info(username)
            .catch(e => display_error(e));

        if (!player)
            return;

        uuid = player.uuid;
        username = player.username;
    }

    await initiate_loading();

    has_fetched_stat = true;

    let stats = await fetch_stat(uuid, stat_type, stat_name)
        .catch(e => display_error(e));

    if (!stats)
        return;

    if (fetch_all) {
        stats = stats.filter(stat => stat.success);
        stats.sort((a, b) => b.stat - a.stat);
    }

    await display_stat(stats, mc_id_to_human(stat_type, false), mc_id_to_human(stat_name, false), !fetch_all)

    stats_loading_finished = true;
};

function mc_id_to_human(source, capitalize = true) {
    source = source
        .replace(/minecraft:/g, "")
        .replace(/_/g, " ")

    if (capitalize) {
        let words = source.split(" ");
        for (let i = 0; i < words.length; i++)
            words[i] = capitalize_first_letter(words[i]);

        source = words.join(" ");
    }

    return source;
}

function human_to_mc_id(source) {
    return "minecraft:" + source
        .toLowerCase()
        .replace(/ /g, "_");
}

async function get_player_info(player) {
    let request = `https://api.ashcon.app/mojang/v2/user/${player}`;
    return await fetch(request)
        .then(response => {
            if (response.status == 404)
                throw error.USERNAME_ERROR;
            else if (!response.ok)
                throw error.REQUEST_ERROR;

            return response.json();
        });
}

async function get_names_from_uuids(uuids) {
    let promises = new Array();
    for (let uuid of uuids) {
        let request = `https://api.ashcon.app/mojang/v2/user/${uuid}`;
        promises.push(fetch(request)
            .then(response => {
                if (!response.ok)
                    throw error.REQUEST_ERROR;

                return response.json();
            })
            .then(player_info => player_info.username)
        );
    }

    return Promise.allSettled(promises);
}

async function fetch_stat(uuid, stat_type, stat_name) {
    let request = `https://api.estillacraft.net/stats?uuid=${uuid}&stat_type=${stat_type}&stat_name=${stat_name}`;

    return fetch(request)
        .then(response => {
            if (!response.ok)
                throw error.REQUEST_ERROR;

            return response.json();
        });
}

async function display_stat(stats, stat_type, stat_name, only_one_player) {
    for (let container of document.getElementsByClassName("stats-container"))
        container.remove();

    if (only_one_player) {
        let stat = stats[0];

        let container = document.createElement("section");
        container.setAttribute("id", "stats-container");
        container.setAttribute("class", "stats-containers");

        let single_stat = document.createElement("div");
        single_stat.setAttribute("id", "single-stat-container");

        let player_info = await get_player_info(stat.uuid)
            .catch(e => display_error(e));
        let player_name = player_info == undefined ? stat.uuid : player_info.username;

        let player_name_span = document.createElement("span");
        let player_head_img = document.createElement("img");
        let stat_span = document.createElement("span");

        player_name_span.innerHTML = player_name;
        player_head_img.setAttribute("src", `https://crafatar.com/renders/body/${stat.uuid}?overlay`);
        stat_span.innerHTML = create_single_stat_phrase(player_name, stat_type, stat_name, stat.stat);

        single_stat.appendChild(player_name_span);
        single_stat.appendChild(player_head_img);
        single_stat.appendChild(stat_span);

        await stop_loading();

        container.appendChild(single_stat);
        document.getElementById("main").appendChild(container);
    } else {
        leaderboard_title = create_leaderboard_title(stat_type, stat_name);

        let leaderboard = document.createElement("section");
        leaderboard.setAttribute("id", "stats-container");
        leaderboard.setAttribute("class", "stats-containers");

        let table = document.createElement("table");
        table.setAttribute("id", "leaderboard");

        let table_header = document.createElement("thead");
        let table_body = document.createElement("tbody");

        table_header.innerHTML = `
            <tr>
                <th colspan="3">${leaderboard_title}</th>
            </tr>
        `;

        table_body.innerHTML = `
            <tr>
                <td>Rank</td>
                <td>Player</td>
                <td>${leaderboard_title}</td>
            </tr>
        `;

        let uuids = stats.map(stat => stat.uuid);
        let names = await get_names_from_uuids(uuids)
            .catch(e => display_error(e));

        let i = 0;
        for (let stat of stats) {
            if (!stat.success)
                continue;

            let row = document.createElement("tr");
            let rank_col = document.createElement("td");
            let player_col = document.createElement("td");
            let stat_col = document.createElement("td");

            let player_head_img = document.createElement("img");
            player_head_img.setAttribute("src", `https://crafatar.com/avatars/${stat.uuid}?size=30`);

            let player_name_p = document.createElement("p");
            player_name_p.innerHTML = names[i].value ?? stat.uuid;

            player_col.appendChild(player_head_img);
            player_col.appendChild(player_name_p);

            i++;
            rank_col.innerHTML = i.toString();
            stat_col.innerHTML = stat_name == "play time" ?
                minecraft_ticks_to_formatted_time(stat.stat):
                format_number(stat.stat);

            row.appendChild(rank_col);
            row.appendChild(player_col);
            row.appendChild(stat_col);

            table_body.appendChild(row);
        }

        table.appendChild(table_header);
        table.appendChild(table_body);

        await stop_loading();

        leaderboard.appendChild(table);
        document.getElementById("main").appendChild(leaderboard);
    }
}


function create_leaderboard_title(stat_type, stat_name) {
    switch (stat_type) {
        case "killed by":
            return capitalize_first_letter(stat_type) + ' ' + add_s_if_not_already(stat_name);
        case "custom":
            return capitalize_first_letter(stat_name);
        default:
            return capitalize_first_letter(add_s_if_not_already(stat_name)) + ' ' + stat_type;
    }
}

function create_single_stat_phrase(username, stat_type, stat_name, stat) {
    if (stat_type != "custom" && stat > 1) {
        if (stat_name.endsWith("man"))
            stat_name = stat_name.substr(0, stat_name.length - 3) + "men";
        else if (stat_type == "killed")
            stat_name = add_s_if_not_already(stat_name);
    } else if (stat_type == "custom") {
        stat_name = mc_id_to_human(stat_name);
     }

    switch (stat_type) {
        case "killed by": case "used":
            let number_expr = new String();
            switch (stat) {
                case 0: number_expr = ""; break;
                case 1: number_expr = "once"; break;
                case 2: number_expr = "twice"; break;
                default: number_expr = `${format_number(stat)} times`;
            }
            return `${username} has ${stat == 0 ? "never" : ""} ${stat_type == "killed by" ? "been killed by" : "used"} ${stat_name} ${number_expr}`;
        case "custom":
            return `${stat_name}: ${stat_name.toLowerCase() == "play time" ?
                    minecraft_ticks_to_formatted_time(stat) : format_number(stat)}`;
        default: 
            return `${username} has ${stat_type} ${format_number(stat)} ${stat_name}`;
    }
}

function capitalize_first_letter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function add_s_if_not_already(word) {
    return word[word.length - 1] == 's' ? word : word + 's';
}

function format_number(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function minecraft_ticks_to_formatted_time(ticks) {
    let seconds = Math.floor(ticks / 20);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours % 24;

    let days_s =  days > 0 ? `${days}d ` : ""; 
    let hours_s = days > 0 || hours > 0 ? `${hours}h ` : "";
    let minutes_s = days > 0 || hours > 0 || minutes > 0 ? `${minutes}m ` : "";
    let seconds_s = `${seconds}s`;

    return days_s + hours_s + minutes_s + seconds_s;
}
