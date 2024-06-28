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
        document.querySelector("#login").loginButton.disabled = false;
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
    "bio": textField
  });

  const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  if (passwordEntry) {
    try {
      const response = await fetch(`${apiBaseURL}/api/users/${loginData.username}`, requestOptions);
      if (!response.ok) {
        throw new Error('Failed to update user information');
      }
      console.log("User information updated successfully");
    } catch (error) {
      console.error('Error updating user information:', error);
    }
  } else { alert('Please input your password'); }
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

  fetch(`${apiBaseURL}/api/users`, requestOptions)
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
  if (document.getElementById('passwordVerification').value) {
    const newBio = document.getElementById('bioTextArea').value;
    document.querySelector('#bioDisplay p').textContent = `Bio: ${newBio}`;
    // Toggle back to display mode
    document.getElementById('bioDisplay').style.display = 'block';
    document.getElementById('bioEdit').style.display = 'none';
  } else {
    document.getElementById('bioDisplay').style.display = 'block';
    document.getElementById('bioEdit').style.display = 'none';
  }
}

async function fetchUsersList() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  myHeaders.append("Authorization", `Bearer ${loginData.token}`); // Fix the Authorization header

  // Generate a random offset between 0 and 300
  const randomOffset = Math.floor(Math.random() * 301); // 0 to 300 (inclusive)

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  try {
    const response = await fetch(`${apiBaseURL}/api/users?offset=${randomOffset}`, requestOptions);
    const userList = await response.json(); // Parse the response as JSON
    return userList; // Return the list of users
  } catch (error) {
    console.error("Error fetching users:", error);
    return null; // Handle the error gracefully
  }
}

function getRandomUsers(userList, count) {
  if (!userList || userList.length === 0) {
    return []; // Return an empty array if userList is null or empty
  }

  const shuffledUsers = userList.slice(); // Create a copy of the original array
  for (let i = shuffledUsers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledUsers[i], shuffledUsers[j]] = [shuffledUsers[j], shuffledUsers[i]]; // Swap elements randomly
  }

  return shuffledUsers.slice(0, count); // Return the first 'count' users
}

async function populateFriendsList() {
  try {
    const userList = await fetchUsersList();
    if (userList) {
      const randomUsers = getRandomUsers(userList, 4);
      return randomUsers; // Return the randomly selected users
    } else {
      console.log("Failed to fetch users.");
      return null; // Return null or handle the error appropriately
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return null; // Return null in case of an error
  }
}

function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function generateGravIcon(_username) {
  let hashedEmail = CryptoJS.SHA256(`${_username}@gmail.com`);
  // Step 2: Construct the Gravatar URL.
  let gravatarUrl = `https://www.gravatar.com/avatar/${hashedEmail}?d=wavatar`;
  console.log(`gravatarUrl ${gravatarUrl}`);
  // Step 3: Set the image source to the Gravatar URL.
  return gravatarUrl;

}


document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname === "/profile.html") {
    const loginData = getLoginData();
    const urlUsername = getUrlParameter('username');

    if (loginData.username) {
      const userInfo = await getUserInfo(loginData.username);
      if (userInfo && userInfo.bio) {
        document.querySelector('#bioContent').textContent = `Bio: ${userInfo.bio}`;
      }
      document.querySelector('.card-title').textContent = loginData.username;
    }

    if (!(urlUsername) || urlUsername == loginData.username) {
      let gavUrl = generateGravIcon(loginData.username);
      document.getElementById('active-user-icon').src = gavUrl;
    } else if (urlUsername != loginData.username) {
      let gavUrl = generateGravIcon(urlUsername);
      document.getElementById('external-user-icon').src = gavUrl;
    }

  }

  if (window.location.pathname === "/posts.html") {
    let gavUrl = generateGravIcon(loginData.username);
    document.getElementById('active-user-icon').src = gavUrl;
  }

});