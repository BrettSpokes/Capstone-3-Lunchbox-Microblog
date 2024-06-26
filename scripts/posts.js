/* Posts Page JavaScript */

"use strict";

const apiBaseURLP = "http://microbloglite.us-east-2.elasticbeanstalk.com";
const loginData = getLoginData();

document.addEventListener('DOMContentLoaded', () => {
    getUser();
    getPosts();
});

function getUser() {

    console.log('setting username');
    document.getElementById('profile-Username').innerText = loginData.username;
}

async function getPosts() {

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

async function likePost(_postId) {
    console.log('liking post', _postId);
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${loginData.token}`);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "postId": `${_postId}`
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch(`${apiBaseURLP}/api/likes`, requestOptions);
        if (response.status === 201) {
            getPosts();
        }
        else if (response.status === 400) {
            console.log('Duplicate Error');
            await handleDeleteLike(_postId);
        } else {
            throw new Error('Error liking post');
        }
    } catch (error) {
        console.error(error);
    }
}

async function handleDeleteLike(_postId) {
    console.log('Post that has a like', _postId);
    const specificPost = await getSpecificPost(_postId);

    // Find the like associated with the current user
    const userLike = specificPost.likes.find(like => like.username === loginData.username);

    if (userLike) {
        console.log('User CaptainPlanet liked this post: like._id', userLike._id);
        deleteLike(userLike._id);
    } else {
        console.log('User CaptainPlanet did not like this post.');
    }
}

async function deleteLike(_likeId) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${loginData.token}`);

    const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        redirect: "follow"
    };

    fetch(`${apiBaseURLP}/api/likes/${_likeId}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            getPosts();
        })
        .catch((error) => console.error(error));
}

async function getSpecificPost(_postId) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${loginData.token}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch(`${apiBaseURLP}/api/posts/${_postId}`, requestOptions);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
        return null; // Handle the error case appropriately
    }
}

async function deletePost(_postId) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${loginData.token}`);

    const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        redirect: "follow"
    };

    fetch(`${apiBaseURLP}/api/posts/${_postId}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            getPosts();
        })
        .catch((error) => console.error(error));
}


function renderPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = ''; // Clear container before adding new posts

    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.classList.add('card', 'mb-3', 'blue-background');

    // Create HTML structure for a post
    postElement.innerHTML = `
        <div class="card-body">
            <p class="card-text">${post.text}</p>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">${post.username} - ${formatDate(post.createdAt)}</small>
                <button class="badge bg-primary" onclick="likePost('${post._id}')">Likes: ${post.likes.length}</button>
                ${post.username === loginData.username
            ? `<button class="badge bg-danger" onclick="deletePost('${post._id}')">Delete</button>`
            : ''
        }
            </div>
        </div>
    `;

    return postElement;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

async function createPost(postData) {

    const requestOptions = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${loginData.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: postData.text }),
        redirect: "follow"
    };

    try {
        const response = await fetch(`${apiBaseURLP}/api/posts`, requestOptions);
        if (!response.ok) throw new Error('Network response was not ok');
        const newPost = await response.json();
        getPosts(); // Refresh the posts after a new post is created
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

const postForm = document.querySelector("#postForm");

postForm.onsubmit = function (event) {
    event.preventDefault();

    const postData = {
        text: postForm.posttextarea.value.trim()
    };

    if (postData.text) {
        createPost(postData);
        postForm.posttextarea.value = ''; // Clear the textarea after submitting
    }
};
