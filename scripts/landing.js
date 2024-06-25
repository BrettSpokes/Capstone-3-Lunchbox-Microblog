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

const registerForm = document.querySelector("#register");

registerForm.onsubmit = function (event) {
    // Prevent the form from refreshing the page,
    // as it will do by default when the Submit event is triggered:
    event.preventDefault();

    // the input element in the form which has the ID of "username".
    const registerData = {
        username: registerForm.reg_username.value,
        fullname: registerForm.reg_firstname.value + ' ' + registerForm.reg_lastname.value,
        password: registerForm.reg_password.value,
    }

    console.log('Register Data', registerData);
     register(registerData);
     
};



document.addEventListener('DOMContentLoaded', function () {
    const formCard = document.querySelector('#form-card');
    const loginForm = document.getElementById('loginFormContainer');
    const registerForm = document.getElementById('registerFormContainer');

    // Get buttons for the transition animation
    const registerButton = document.getElementById('registerFormButton');
    const loginButton = document.getElementById('loginFormButton');
    
    const transitionButtons = [registerButton, loginButton];
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
    formCard.classList.add('login-card');

    transitionButtons.forEach(element => {
        element.addEventListener('click', function () {

            // Disable scrolling before animation starts
            disableScroll();

            // Slide down the current card
            formCard.classList.add('slide-down');

            // Toggle body background color classes
            body.classList.toggle('blue-background');
            body.classList.toggle('red-background');

            // After a delay, slide up the new registration card
            setTimeout(() => {
                // Remove slide-down class and add slide-up class to bring in registration card
                formCard.classList.remove('slide-down');
                formCard.classList.add('slide-up');

                // Swap card background colors using class toggle
                formCard.classList.toggle('login-card');
                formCard.classList.toggle('registration-card');

                // Toggle visibility of login and register forms
                loginForm.classList.toggle('hide-element');
                registerForm.classList.toggle('hide-element');

                // Enable scrolling after animation completes
                enableScroll();
            }, 500); // Adjust timing to match transition duration in CSS
        });
    });
});