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
    console.log('Register Data', registerData); // Log registerData to console for debugging
    register(registerData); // Process registration using registerData
};

// Initialize transitions and background colors on page load
document.addEventListener('DOMContentLoaded', function () {
    const formCard = document.querySelector('#form-card'); // Get the main form card element
    const loginForm = document.getElementById('loginFormContainer'); // Get the login form container
    const registerForm = document.getElementById('registerFormContainer'); // Get the register form container
    const registerButton = document.getElementById('registerFormButton'); // Get the register form toggle button
    const loginButton = document.getElementById('loginFormButton'); // Get the login form toggle button
    const transitionButtons = [registerButton, loginButton]; // Array of form toggle buttons
    const body = document.body; // Get the body element
    const mainLogo = document.getElementById('mainLogo');
    const logoTop = document.getElementById('logoTop');
    const logoBottom = document.getElementById('logoBottom');
    const siteDescription = document.getElementById('siteDescription');

    mainLogo.addEventListener('click', function () {
        // Hide main logo and show top and bottom logos
        mainLogo.classList.add('d-none');
        logoTop.classList.remove('d-none');
        logoBottom.classList.remove('d-none');

        // Trigger animation by adding a class
        logoTop.classList.add('animate-logo-top');
        logoBottom.classList.add('animate-logo-bottom');

        // Fade in site description
        siteDescription.classList.add('fade-in');
        siteDescription.classList.remove('d-none');
    });


    // Function to disable scrolling on the body
    function disableScroll() {
        body.classList.add('no-scroll');
    }

    // Function to enable scrolling on the body
    function enableScroll() {
        body.classList.remove('no-scroll');
    }

    // Set initial background color and card class for login form
    body.classList.add('blue-background');
    formCard.classList.add('login-card');

    // Add click event listeners to form toggle buttons for transition animations
    transitionButtons.forEach(element => {
        element.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            disableScroll(); // Disable scrolling before animation starts
            formCard.classList.add('slide-down'); // Slide down current form card
            body.classList.toggle('blue-background'); // Toggle body background color
            body.classList.toggle('red-background'); // Toggle body background color
            setTimeout(() => {
                formCard.classList.remove('slide-down'); // Remove slide-down class
                formCard.classList.add('slide-up'); // Add slide-up class for new form card
                formCard.classList.toggle('login-card'); // Toggle card class for animation
                formCard.classList.toggle('registration-card'); // Toggle card class for animation
                loginForm.classList.toggle('hide-element'); // Toggle visibility of login form
                registerForm.classList.toggle('hide-element'); // Toggle visibility of register form
                enableScroll(); // Enable scrolling after animation completes
            }, 500); // Adjust timing to match CSS transition duration
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

    //Show and hide the elements by modifying their class list
    mainLogo.classList.remove('d-none');
    siteDescription.classList.add('d-none');
    logoTop.classList.add('d-none'); 
    logoBottom.classList.add('d-none');
}