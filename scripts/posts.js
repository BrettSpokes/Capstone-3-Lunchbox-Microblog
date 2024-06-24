/* Posts Page JavaScript */

"use strict";

const apiBaseURLP = "http://microbloglite.us-east-2.elasticbeanstalk.com";

document.addEventListener('DOMContentLoaded', () => {
    getPosts();
});

async function getPosts() {
    const loginData = getLoginData();

    const requestOptions = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
        },
        redirect: "follow"
    };

    try {
        const response = await fetch(`${apiBaseURLP}/api/posts?limit=10&offset=0`, requestOptions);
        const posts = await response.json();

        // Call function to render posts
        renderPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function renderPosts(posts) {
    const postsContainer = document.getElementById('posts-container');

    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    // Create HTML structure for a post
    postElement.innerHTML = `
        <div class="post-text">${post.text}</div>
        <div class="post-info">
            <div class="post-author">${post.username}</div>
            <div class="post-date">${formatDate(post.createdAt)}</div>
            <div class="post-likes">Likes: ${post.likes.length}</div>
        </div>
    `;

    return postElement;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function createPost(postData) {
    const loginData = getLoginData();
    console.log(`Post Text: ${postData}`);
    
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${loginData.token}`);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "text": `${postData.text}`
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(`${apiBaseURLP}/api/posts`, requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
}

const postForm = document.querySelector("#postForm");

postForm.onsubmit = function (event) {
    // Prevent the form from refreshing the page,
    // as it will do by default when the Submit event is triggered:
    event.preventDefault();

    // the input element in the form which has the ID of "username".
    const postData = {
        text: postForm.posttextarea.value
    }

    console.log('Post Data', postData);
     createPost(postData);
     
};

