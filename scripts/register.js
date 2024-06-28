"use strict";

const registerForm = document.querySelector("#register");

registerForm.onsubmit = function (event) {
    // Prevent the form from refreshing the page,
    event.preventDefault();

    // the input element in the form which has the ID of "username".
    const registerData = {
        username: registerForm.username.value,
        fullname: registerForm.firstname.value + ' ' + registerForm.lastname.value,
        password: registerForm.password.value,
    }

    console.log('Register Data', registerData);
     register(registerData);
     
};
