const error =  {
    WRONG_USERNAME: 1,
    REQUEST_ERROR: 2
};

document.getElementById("error-close").onclick = event => {
    event.target.parentNode.style.display = "none";
}

function error_message(error_type) {
    switch (error_type) {
        case error.WRONG_USERNAME:
            return "The username you entered doesn't exist";        
        case error.REQUEST_ERROR:
            return "There was an error fetching data";
    }
}

function display_error(error) {
    if (typeof error == "number")
        document.getElementById("error-message").innerHTML = error_message(error);
    else if (error instanceof TypeError)
        document.getElementById("error-message").innerHTML = "NetworkError: this errors usually occurs when you've entered a non-existant username.";
    else
        document.getElementById("error-message").innerHTML = "Unhandled error: " + error.toString();

    document.getElementById("error").style.display = "flex";

    // stop_loading();
}
