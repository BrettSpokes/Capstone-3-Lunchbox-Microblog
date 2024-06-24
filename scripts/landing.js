/* Landing Page JavaScript */

"use strict";

const loginForm = document.querySelector("#login");

loginForm.onsubmit = function (event) {
    // Prevent the form from refreshing the page,
    // as it will do by default when the Submit event is triggered:
    event.preventDefault();

    // We can use loginForm.username (for example) to access
    // the input element in the form which has the ID of "username".
    const loginData = {
        username: loginForm.username.value,
        password: loginForm.password.value,
    }

    // Disables the button after the form has been submitted already:
    loginForm.loginButton.disabled = true;

    // Time to actually process the login using the function from auth.js!
    login(loginData);
};

document.addEventListener('DOMContentLoaded', function () {
    const loginCard = document.querySelector(".form-card");
    const registerButton = document.querySelector("#registerButton");
    const body = document.body;

    // Function to disable scrolling
    function disableScroll() {
        body.classList.add('no-scroll');
    }

    // Function to enable scrolling
    function enableScroll() {
        body.classList.remove('no-scroll');
    }

    // Initially set the background color and card class for login
    body.classList.add('blue-background');
    loginCard.classList.add('login-card');

    registerButton.addEventListener('click', function () {
        // Disable scrolling before animation starts
        disableScroll();

        // Slide down the current card
        loginCard.classList.add('slide-down');

        // Toggle body background color classes
        body.classList.toggle('blue-background');
        body.classList.toggle('red-background');

        // After a delay, slide up the new registration card
        new Promise(resolve => {
            setTimeout(() => {
                // Remove slide-down class and add slide-up class to bring in registration card
                loginCard.classList.remove('slide-down');
                loginCard.classList.add('slide-up');

                // Swap card background colors using class toggle
                loginCard.classList.toggle('login-card');
                loginCard.classList.toggle('registration-card');

                // Enable scrolling after animation completes

                // Reset button state and text (for demonstration)
                registerButton.disabled = false;
                registerButton.textContent = 'Register';


            }, 500); // Adjust timing to match transition duration in CSS
        }).then(() => {
            enableScroll();
        });
    });
});
