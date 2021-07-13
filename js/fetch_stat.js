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
            option.text = mc_id_to_human(thing.id);
            option.value = thing.id;
            datalist.appendChild(option);
        }
    }
}

async function get_stat() {
    stats_loading_finished = false;
    await initiate_loading();

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

        if (!player)
            return;

        uuid = player.id;
        username = player.name;
    }

    let stats = await fetch_stat(uuid, stat_type, stat_name)
        .catch(e => display_error(e));

    if (!stats)
        return;

    stats.sort((a, b) => b.stat - a.stat);

    display_stat(stats, mc_id_to_human(stat_type, false), mc_id_to_human(stat_name, false), !fetch_all)
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

}


async function get_player_info(username) {
    let request = `https://api.mojang.com/users/profiles/minecraft/${username}`;
    return await fetch(request)
        .then(response => {
            if (response.status == 204)
                throw new Error(error.WRONG_USERNAME);
            else if (!response.ok)
                throw new Error(error.REQUEST_ERROR);

            return response.json();
        });
}

async function get_username_from_uuid(uuid) {
    let request = `https://api.mojang.com/user/profiles/${uuid}/names`;
    return await fetch(request)
        .then(response => {
            if (!response.ok)
                throw new Error(error.REQUEST_ERROR);

            return response.json();
        })
        .then(name_history => name_history[name_history.length - 1].name);
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

async function display_stat(stats, stat_type, stat_name, only_one_player) {
    if (only_one_player) {

    } else {
        leaderboard_title = create_leaderboard_title(stat_type, stat_name);

        let leaderboard = document.createElement("section");
        leaderboard.setAttribute("id", "leaderboard-section");

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

        let i = 0;
        for (let stat of stats) {
            if (!stat.success)
                continue;

            i++;

            let row = document.createElement("tr");
            let rank_col = document.createElement("td");
            let player_col = document.createElement("td");
            let stat_col = document.createElement("td");

            let player_head_img = document.createElement("img");
            player_head_img.setAttribute("src", `https://crafatar.com/avatars/${stat.uuid}?size=30`);

            let player_name_p = document.createElement("p");
            player_name_p.innerHTML = await get_username_from_uuid(stat.uuid)
                .catch(e => display_error(e)) || stat.uuid;

            player_col.appendChild(player_head_img);
            player_col.appendChild(player_name_p);

            rank_col.innerHTML = i.toString();
            stat_col.innerHTML = format_number(stat.stat);

            row.appendChild(rank_col);
            row.appendChild(player_col);
            row.appendChild(stat_col);

            table_body.appendChild(row);
        }

        table.appendChild(table_header);
        table.appendChild(table_body);

        stats_loading_finished = true;
        has_fetched_stat = true;

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

function capitalize_first_letter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function add_s_if_not_already(word) {
    return word[word.length - 1] == 's' ? word : word + 's';
}

function format_number(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
