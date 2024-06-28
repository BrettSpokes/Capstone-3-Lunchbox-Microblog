"use strict";

// Handle login form submission
const loginForm = document.querySelector("#login");

loginForm.onsubmit = function (event) {
    event.preventDefault(); // Prevent form submission from refreshing the page
    const loginData = {
        username: loginForm.username.value,
        password: loginForm.password.value,
    }
    loginForm.loginButton.disabled = true; // Disable login button to prevent multiple submissions
    login(loginData); // Process login using loginData
};

// Handle register form submission
const registerForm = document.querySelector("#register");
registerForm.onsubmit = function (event) {
    event.preventDefault(); // Prevent form submission from refreshing the page
    const registerData = {
        username: registerForm.reg_username.value,
        fullname: registerForm.reg_firstname.value + ' ' + registerForm.reg_lastname.value,
        password: registerForm.reg_password.value,
    }
    register(registerData); // Process registration using registerData
};

// Initialize transitions and background colors on page load
document.addEventListener('DOMContentLoaded', function () {
    const formCard = document.querySelector('#form-card');
    const loginForm = document.getElementById('loginFormContainer');
    const registerForm = document.getElementById('registerFormContainer');
    const registerButton = document.getElementById('registerFormButton');
    const loginButton = document.getElementById('loginFormButton');
    const transitionButtons = [registerButton, loginButton];
    const body = document.body;
    const mainLogo = document.getElementById('mainLogo');
    const logoTop = document.getElementById('logoTop');
    const logoBottom = document.getElementById('logoBottom');
    const siteDescription = document.getElementById('siteDescription');

    mainLogo.addEventListener('click', function () {
        // Handle main logo click and trigger animations
        mainLogo.classList.add('d-none');
        logoTop.classList.remove('d-none');
        logoBottom.classList.remove('d-none');
        logoTop.classList.add('animate-logo-top');
        logoBottom.classList.add('animate-logo-bottom');
        siteDescription.classList.add('fade-in');
        siteDescription.classList.remove('d-none');
    });

    function disableScroll() {
        body.classList.add('no-scroll'); // Disable scrolling
    }

    function enableScroll() {
        body.classList.remove('no-scroll'); // Enable scrolling
    }

    // Set initial background color and card class for login form
    body.classList.add('blue-background');
    formCard.classList.add('login-card');

    // Add click event listeners to form toggle buttons for transition animations
    transitionButtons.forEach(element => {
        element.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            disableScroll();
            formCard.classList.add('slide-down');
            body.classList.toggle('blue-background');
            body.classList.toggle('red-background');
            setTimeout(() => {
                formCard.classList.remove('slide-down');
                formCard.classList.add('slide-up');
                formCard.classList.toggle('login-card');
                formCard.classList.toggle('registration-card');
                loginForm.classList.toggle('hide-element');
                registerForm.classList.toggle('hide-element');
                enableScroll();
            }, 500);
        });
    });

    // Add click event listeners to logoTop and logoBottom
    logoTop.addEventListener('click', function () {
        resetLogo();
    });

    logoBottom.addEventListener('click', function () {
        resetLogo();
    });

});

// Function to reset the logo to mainLogo and hide logoTop and logoBottom
function resetLogo() {
    const mainLogo = document.getElementById('mainLogo');
    const logoTop = document.getElementById('logoTop');
    const logoBottom = document.getElementById('logoBottom');
    const siteDescription = document.getElementById('siteDescription');

    // Show and hide the elements by modifying their class list
    mainLogo.classList.remove('d-none');
    siteDescription.classList.add('d-none');
    logoTop.classList.add('d-none'); 
    logoBottom.classList.add('d-none');
}
