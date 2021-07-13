// Variable to keep track if wether or not the user has fetched a stat
var has_fetched_stat = false;

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
        remove_desc = true;
    } else {

    }

    let loading_icon = document.createElement("img");
    loading_icon.setAttribute("id", "loading-icon");
    loading_icon.setAttribute("src", "images/estillacraft_logo_transparent_cropped.png");

    await sleep(500);
    if (remove_desc)
        desc_container.remove();

    document.getElementById("main").appendChild(loading_icon);
}

async function stop_loading() {
    let loading_icon = document.getElementById("loading-icon");
    if (!loading_icon)
        return;

    loading_icon.style.opacity = 1;
    await sleep(200);
    console.log(loading_icon.style.opacity);
    loading_icon.style.opacity = 0;
    await sleep(500);
    console.log(loading_icon.style.opacity);
    // loading_icon.remove();
}
