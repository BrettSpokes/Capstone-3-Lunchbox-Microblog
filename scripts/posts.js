"use strict";

const apiBaseURLP = "http://microbloglite.us-east-2.elasticbeanstalk.com";
const loginData = getLoginData();
let allPosts = []; // To store all fetched posts initially
let currentPage = 0; // Current page for pagination, starting from 0

document.addEventListener('DOMContentLoaded', () => {
    getUser();
    fetchAllPosts(); // Initial fetch of all posts for sorting

    document.getElementById('sortOptions').addEventListener('change', sortAndRenderPosts);
    document.getElementById('postForm').addEventListener('submit', createPost);

    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            renderPosts();
        }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
        currentPage++;
        renderPosts();
    });
});

async function fetchAllPosts() {
    const requestOptions = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
        },
        redirect: "follow"
    };

    try {
        const response = await fetch(`${apiBaseURLP}/api/posts?limit=0&offset=0`, requestOptions); // Fetch all posts
        if (!response.ok) {
            throw new Error('Error fetching posts');
        }
        allPosts = await response.json(); // Store all posts locally
        sortAndRenderPosts(); // Sort and render posts after fetching
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function sortAndRenderPosts() {
    const sortOption = document.getElementById('sortOptions').value;
    switch (sortOption) {
        case 'username':
            allPosts.sort((a, b) => a.username.localeCompare(b.username));
            break;
        case 'likes':
            allPosts.sort((a, b) => b.likes.length - a.likes.length);
            break;
        case 'recent':
        default:
            allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
    currentPage = 0; // Reset to first page after sorting
    renderPosts();
}

async function createPost(event) {
    event.preventDefault();

    const postText = document.getElementById('posttextarea').value;

    if (!postText) {
        alert("Post content cannot be empty!");
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${loginData.token}`);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        text: postText
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch(`${apiBaseURLP}/api/posts`, requestOptions);
        if (response.ok) {
            document.getElementById('posttextarea').value = '';
            fetchAllPosts(); // After creating a post, refetch all posts for updated list
        } else {
            throw new Error('Error creating post');
        }
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

async function deletePost(postId) {
    const requestOptions = {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
        },
        redirect: "follow"
    };

    try {
        const response = await fetch(`${apiBaseURLP}/api/posts/${postId}`, requestOptions);
        if (response.ok) {
            fetchAllPosts(); // After deleting a post, refetch all posts for updated list
        } else {
            throw new Error('Error deleting post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
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
            fetchAllPosts(); // After liking a post, refetch all posts for updated list
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

    const userLike = specificPost.likes.find(like => like.username === loginData.username);

    if (userLike) {
        console.log(`User ${loginData.username} liked this post: like._id`, userLike._id);
        deleteLike(userLike._id);
    } else {
        console.log(`User ${loginData.username} did not like this post.`);
    }
}

async function getSpecificPost(postId) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${loginData.token}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const response = await fetch(`${apiBaseURLP}/api/posts/${postId}`, requestOptions);
    return response.json();
}

async function deleteLike(_likeId) {
    console.log('Deleting like with ID:', _likeId);

    const requestOptions = {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
        },
        redirect: "follow"
    };

    try {
        const response = await fetch(`${apiBaseURLP}/api/likes/${_likeId}`, requestOptions);
        if (response.ok) {
            console.log('Like deleted successfully.');
            fetchAllPosts(); // After deleting a like, refetch all posts for updated list
        } else {
            throw new Error('Error deleting like');
        }
    } catch (error) {
        console.error('Error deleting like:', error);
    }
}

function renderPosts() {
    const postsPerPage = 10;
    const start = currentPage * postsPerPage;
    const end = start + postsPerPage;
    const paginatedPosts = allPosts.slice(start, end);

    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    paginatedPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });

    updatePaginationButtons();
}

function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'card blue-background mb-3';

    const postBody = document.createElement('div');
    postBody.className = 'card-body';

    // Username as a clickable link
    const usernameLink = document.createElement('a');
    usernameLink.href = `/profile.html?username=${encodeURIComponent(post.username)}`; // Encode username for URL
    usernameLink.className = 'card-title h2 text-decoration-none';
    usernameLink.innerText = post.username;
    usernameLink.style.cursor = 'pointer'; // Change cursor to pointer for better UX
    usernameLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        window.location.href = usernameLink.href; // Navigate to profile.html with username parameter
    });

    const postText = document.createElement('p');
    postText.className = 'card-text';
    postText.innerText = post.text;

    const postTime = document.createElement('p');
    postTime.className = 'card-time text-muted';
    postTime.innerText = new Date(post.createdAt).toLocaleString();

    const postFooter = document.createElement('div');
    postFooter.className = 'card-footer';

    const likeButton = document.createElement('button');
    likeButton.className = 'btn btn-primary';
    likeButton.innerText = `Like (${post.likes.length})`;
    likeButton.onclick = () => likePost(post._id);

    postFooter.appendChild(likeButton);

    // Conditionally add delete button if the logged-in user created the post
    if (post.username === loginData.username) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.innerText = 'Delete';
        deleteButton.onclick = () => deletePost(post._id);
        postFooter.appendChild(deleteButton);
    }

    postBody.appendChild(usernameLink); // Append username link instead of title
    postBody.appendChild(postText);
    postBody.appendChild(postTime);
    postBody.appendChild(postFooter);
    postElement.appendChild(postBody);

    return postElement;
}


function updatePaginationButtons() {
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    prevPageBtn.disabled = currentPage === 0;
    nextPageBtn.disabled = currentPage >= Math.ceil(allPosts.length / 10) - 1;

    // Display current page number
    document.getElementById('pageIndicator').innerText = `Page ${currentPage + 1}`;
}

function getUser() {
    const usernameElement = document.getElementById('profile-Username');
    if (loginData && loginData.username) {
        usernameElement.innerText = loginData.username;
    } else {
        usernameElement.innerText = '';
    }
}

