"use strict";

const apiBaseURL = "http://microbloglite.us-east-2.elasticbeanstalk.com";
// Backup server (mirror):   "https://microbloglite.onrender.com"

// NOTE: API documentation is available at /docs 
// For example: http://microbloglite.us-east-2.elasticbeanstalk.com/docs

// You can use this function to get the login data of the logged-in
// user (if any). It returns either an object including the username
// and token, or an empty object if the visitor is not logged in.
function getLoginData() {
  const loginJSON = window.localStorage.getItem("login-data");
  return JSON.parse(loginJSON) || {};
}

// You can use this function to see whether the current visitor is
// logged in. It returns either `true` or `false`.
function isLoggedIn() {
  const loginData = getLoginData();
  return Boolean(loginData.token);
}

// This function is already being used in the starter code for the
// landing page, in order to process a user's login. READ this code,
// and feel free to re-use parts of it for other `fetch()` requests
// you may need to write.
async function login(loginData) {
  // POST /auth/login
  const options = {
    method: "POST",
    headers: {
      // This header specifies the type of content we're sending.
      // This is required for endpoints expecting us to send
      // JSON data.
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  };

  return fetch(apiBaseURL + "/auth/login", options)
    .then(response => response.json())
    .then(loginData => {
      if (loginData.message === "Invalid username or password") {
        console.error(loginData)
        // Here is where you might want to add an error notification 
        // or other visible indicator to the page so that the user is  
        // informed that they have entered the wrong login info.

        return null
      }
      window.localStorage.setItem("login-data", JSON.stringify(loginData));
      window.location.assign("/posts.html");  // redirect

      return loginData;
    });
}

// This is the `logout()` function you will use for any logout button
// which you may include in various pages in your app. Again, READ this
// function and you will probably want to re-use parts of it for other
// `fetch()` requests you may need to write.
function logout() {
  const loginData = getLoginData();

  // GET /auth/logout
  const options = {
    method: "GET",
    headers: {
      // This header is how we authenticate our user with the
      // server for any API requests which require the user
      // to be logged-in in order to have access.
      // In the API docs, these endpoints display a lock icon.
      Authorization: `Bearer ${loginData.token}`,
    },
  };

  fetch(apiBaseURL + "/auth/logout", options)
    .then(response => response.json())
    .then(data => console.log(data))
    .finally(() => {
      // We're using `finally()` so that we will continue with the
      // browser side of logging out (below) even if there is an 
      // error with the fetch request above.

      window.localStorage.removeItem("login-data");  // remove login data from LocalStorage
      window.location.assign("/");  // redirect back to landing page
    });
}

// Custom Code

async function getUserInfo(_currentUser) {
  const loginData = getLoginData(); // Ensure loginData is fetched here
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  myHeaders.append("Authorization", `Bearer ${loginData.token}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  try {
    const response = await fetch(`${apiBaseURL}/api/users/${_currentUser}`, requestOptions);
    if (!response.ok) {
      throw new Error('Failed to fetch user information');
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function updateUser() {
  const loginData = getLoginData();
  const passwordEntry = document.getElementById('passwordVerification').value;
  const textField = document.getElementById('bioTextArea').value;
  
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  myHeaders.append("Authorization", `Bearer ${loginData.token}`);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
      "password": passwordEntry,
      "bio": textField
  });

  const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
  };

  try {
      const response = await fetch(`${apiBaseURL}/api/users/${loginData.username}`, requestOptions);
      if (!response.ok) {
          throw new Error('Failed to update user information');
      }
      console.log("User information updated successfully");
  } catch (error) {
      console.error('Error updating user information:', error);
  }
}

function register(registerData) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "username": `${registerData.username}`,
    "fullName": `${registerData.fullname}`,
    "password": `${registerData.password}`
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/users", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      login(registerData);
    })
    .catch((error) => console.error(error));
}

function editBio() {
  document.getElementById('bioDisplay').style.display = 'none';
  document.getElementById('bioEdit').style.display = 'block';
  // Populate textarea with current bio content without the "Bio: " prefix
  const currentBio = document.querySelector('#bioDisplay p').textContent.trim().replace(/^Bio:\s*/, '');
  document.getElementById('bioTextArea').value = currentBio;
}

async function saveBio() {
  await updateUser(); // Call updateUser to save changes
  // Update displayed bio
  const newBio = document.getElementById('bioTextArea').value;
  document.querySelector('#bioDisplay p').textContent = `Bio: ${newBio}`;
  // Toggle back to display mode
  document.getElementById('bioDisplay').style.display = 'block';
  document.getElementById('bioEdit').style.display = 'none';
}

// Adding the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", async () => {
  const loginData = getLoginData();
  if (loginData.username) {
    const userInfo = await getUserInfo(loginData.username);
    if (userInfo && userInfo.bio) {
      document.querySelector('#bioContent').textContent = `Bio: ${userInfo.bio}`;
    }
    // Set the username in the card title
    document.querySelector('.card-title').textContent = loginData.username;
  }
});
