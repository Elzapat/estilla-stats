// Variable to keep track if wether or not the user has fetched a stat
var has_fetched_stat = false;
var stats_load_finished = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function initiate_loading() {
    // Remove any present loading icons
    {
        let loading_icon = document.getElementById("loading-icon");
        if (loading_icon)
            loading_icon.remove();
    }

    let remove_desc = false;

    if (!has_fetched_stat) {
        var desc_container = document.getElementById("description");
        desc_container.style.transform = "translateX(-100vw)";
        desc_container.style.position = "absolute";
        remove_desc = true;
    } else {
        var lb_container = document.getElementById("leaderboard-section");
        lb_container.style.transform = "translateX(-100vw)";
        lb_container.style.position = "absolute";
    }

    let loading_icon = document.createElement("img");
    loading_icon.setAttribute("id", "loading-icon");
    loading_icon.setAttribute("src", "images/estillacraft_logo_transparent_cropped.png");

    setTimeout(() => {
        if (remove_desc)
            desc_container.remove();
        else
            lb_container.remove();

        if (stats_loading_finished) return;

        document.getElementById("main").appendChild(loading_icon);
    }, 500);
}

async function stop_loading() {
    let loading_icon = document.getElementById("loading-icon");
    if (!loading_icon)
        return;

    loading_icon.style.opacity = 0;
    await sleep(300);
    loading_icon.remove();
}
