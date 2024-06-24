"use strict";

function redirWindow(destination) {
    window.location.assign(destination);
}

// Function to check the current path and redirect if necessary
function checkPathAndRedirect() {
    const currentPath = window.location.pathname;
    const loginRequiredPaths = ["/index.html", "/"];  // Add more paths if necessary
    const loggedIn = isLoggedIn();

    if (loginRequiredPaths.includes(currentPath) && loggedIn) {
        window.location.replace("/posts.html");
    }
}

// Call the function on page load
window.onload = checkPathAndRedirect;
