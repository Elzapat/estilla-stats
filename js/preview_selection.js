let active_preview = document.getElementById("placeholder-preview");

let dynmap_preview = document.getElementById("dynmap-preview");
let stats_preview = document.getElementById("stats-preview");
let world_dl_preview = document.getElementById("world-dl-preview");

document.getElementById("dynmap-button").onclick = () => {
    active_preview.style.display = "none"; 
    dynmap_preview.style.display = "flex";
    active_preview = dynmap_preview;
}

document.getElementById("stats-button").onclick = () => {
    active_preview.style.display = "none"; 
    stats_preview.style.display = "flex";
    active_preview = stats_preview;
}

document.getElementById("world-dl-button").onclick = () => {
    active_preview.style.display = "none"; 
    world_dl_preview.style.display = "flex";
    active_preview = world_dl_preview;
}
