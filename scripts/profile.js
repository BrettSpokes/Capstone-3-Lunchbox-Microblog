"use strict";



document.addEventListener('DOMContentLoaded', function () {
    const loginData = getLoginData();

    // Fetch username parameter from the URL
    const urlUsername = getUrlParameter('username');

    console.log("LoggedInUsername", loginData.username);
    console.log('urlUsername', urlUsername);

    // Select profile cards
    const localProfileCard = document.getElementById('profile-page-card');
    const externalProfileCard = document.getElementById('external-profile-card');
    const postContainer = document.getElementById('create-post-container');
    const friendContainer = document.getElementById('friends-list-container');

    if (!(urlUsername) || urlUsername == loginData.username) {
        console.log('local user');
        // Hide externalProfileCard and show localProfileCard
        externalProfileCard.classList.add('hide-element');
        localProfileCard.classList.remove('hide-element');
        postContainer.classList.remove('hide-element');
        friendContainer.classList.remove('hide-element');
    } else if (urlUsername != loginData.username) {
        console.log('external user');
        // Hide localProfileCard and show externalProfileCard
        localProfileCard.classList.add('hide-element');
        externalProfileCard.classList.remove('hide-element');

        getExternalUserData(urlUsername);

    } else {

    }
});

async function getExternalUserData(username){
    let exData = await getUserInfo(username);
    console.log('exData', exData);

    document.getElementById('ex-profile-Username').textContent = username;
    document.getElementById('ex-bioContent').textContent = `Bio: ${exData.bio}`;

}