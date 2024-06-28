"use strict";

const apiBaseURL = "http://microbloglite.us-east-2.elasticbeanstalk.com";

// Function to get login data from local storage
function getLoginData() {
  const loginJSON = window.localStorage.getItem("login-data");
  return JSON.parse(loginJSON) || {};
}

// Function to check if the user is logged in
function isLoggedIn() {
  const loginData = getLoginData();
  return Boolean(loginData.token);
}

// Function to handle user login
async function login(loginData) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  };

  return fetch(apiBaseURL + "/auth/login", options)
    .then(response => response.json())
    .then(loginData => {
      if (loginData.message === "Invalid username or password") {
        document.querySelector("#login").loginButton.disabled = false;
        return null;
      }
      window.localStorage.setItem("login-data", JSON.stringify(loginData));
      window.location.assign("/posts.html");

      return loginData;
    });
}

// Function to handle user logout
function logout() {
  const loginData = getLoginData();

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  };

  fetch(apiBaseURL + "/auth/logout", options)
    .then(response => response.json())
    .then(data => console.log(data))
    .finally(() => {
      window.localStorage.removeItem("login-data");
      window.location.assign("/");
    });
}

// Function to get user information from the API
async function getUserInfo(_currentUser) {
  const loginData = getLoginData();
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

// Function to update user bio information
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
    } catch (error) {
      console.error('Error updating user information:', error);
    }
  } else { alert('Please input your password'); }
}

// Function to register a new user
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
      login(registerData);
    })
    .catch((error) => console.error(error));
}

// Function to switch bio display mode to edit mode
function editBio() {
  document.getElementById('bioDisplay').style.display = 'none';
  document.getElementById('bioEdit').style.display = 'block';
  const currentBio = document.querySelector('#bioDisplay p').textContent.trim().replace(/^Bio:\s*/, '');
  document.getElementById('bioTextArea').value = currentBio;
}

// Function to save the updated bio
async function saveBio() {
  await updateUser();
  if (document.getElementById('passwordVerification').value) {
    const newBio = document.getElementById('bioTextArea').value;
    document.querySelector('#bioDisplay p').textContent = `Bio: ${newBio}`;
    document.getElementById('bioDisplay').style.display = 'block';
    document.getElementById('bioEdit').style.display = 'none';
  } else {
    document.getElementById('bioDisplay').style.display = 'block';
    document.getElementById('bioEdit').style.display = 'none';
  }
}

// Function to fetch a list of users from the API
async function fetchUsersList() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  myHeaders.append("Authorization", `Bearer ${loginData.token}`);

  const randomOffset = Math.floor(Math.random() * 301);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  try {
    const response = await fetch(`${apiBaseURL}/api/users?offset=${randomOffset}`, requestOptions);
    const userList = await response.json();
    return userList;
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
}

// Function to get a random subset of users from a list
function getRandomUsers(userList, count) {
  if (!userList || userList.length === 0) {
    return [];
  }

  const shuffledUsers = userList.slice();
  for (let i = shuffledUsers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledUsers[i], shuffledUsers[j]] = [shuffledUsers[j], shuffledUsers[i]];
  }

  return shuffledUsers.slice(0, count);
}

// Function to populate friends list with random users
async function populateFriendsList() {
  try {
    const userList = await fetchUsersList();
    if (userList) {
      const randomUsers = getRandomUsers(userList, 4);
      return randomUsers;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
}

// Function to get URL parameter by name
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Function to generate Gravatar URL based on username
function generateGravIcon(_username) {
  let hashedEmail = CryptoJS.SHA256(`${_username}@gmail.com`);
  let gravatarUrl = `https://www.gravatar.com/avatar/${hashedEmail}?d=wavatar`;
  return gravatarUrl;
}

// Event listener for DOMContentLoaded to initialize profile and posts pages
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
