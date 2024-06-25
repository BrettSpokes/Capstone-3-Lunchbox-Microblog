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
                <span class="badge bg-primary">Likes: ${post.likes.length}</span>
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
    const loginData = getLoginData();

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
