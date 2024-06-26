"use strict";

function redirWindow(destination) {
    window.location.assign(destination);
}

// Function to check the current path and redirect if necessary
function checkPathAndRedirect() {
    const currentPath = window.location.pathname;
    const loginRequiredPaths = ["/index.html", "/"];
    const walledPaths = ["/posts.html", "/profile.html"];
    const loggedIn = isLoggedIn();

    if (loginRequiredPaths.includes(currentPath) && loggedIn) {
        window.location.replace("/posts.html");
    }

    if (walledPaths.includes(currentPath) && !loggedIn) {
        console.log('Redirect to home')
        window.location.replace("/index.html");
    }
}

// Call the function on page load
window.onload = checkPathAndRedirect;
