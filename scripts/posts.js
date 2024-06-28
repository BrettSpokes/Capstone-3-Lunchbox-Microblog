"use strict";

// Initialize base URL and user data
const apiBaseURLP = "http://microbloglite.us-east-2.elasticbeanstalk.com";
const loginData = getLoginData();
const urlUsername = getUrlParameter('username');

let allPosts = [];
let currentPage = 0;

document.addEventListener('DOMContentLoaded', () => {
    getUser();
    renderFriendsList();

    if (window.location.pathname.includes('/posts.html') || window.location.pathname.includes('/profile.html')) {
        fetchAllPosts();

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
    }
});

// Fetch all posts from the API
async function fetchAllPosts() {
    const requestOptions = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
        },
        redirect: "follow"
    };

    try {
        const response = await fetch(`${apiBaseURLP}/api/posts?limit=0&offset=0`, requestOptions);
        if (!response.ok) {
            throw new Error('Error fetching posts');
        }
        allPosts = await response.json();
        filterUserPosts();
        sortAndRenderPosts();
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

// Filter posts based on the profile being viewed
function filterUserPosts() {
    if (window.location.pathname.includes('/profile.html')) {
        if (!urlUsername || urlUsername === loginData.username) {
            allPosts = allPosts.filter(post => post.username === loginData.username);
        } else {
            allPosts = allPosts.filter(post => post.username === urlUsername);
        }
    }
}

// Sort and render posts based on selected criteria
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
    currentPage = 0;
    renderPosts();
}

// Create a new post
async function createPost(event) {
    event.preventDefault();

    const postText = document.getElementById('posttextarea').value;

    if (!postText) {
        alert("Post content cannot be empty!");
        return;
    }

    const myHeaders = new Headers({
        "accept": "application/json",
        "Authorization": `Bearer ${loginData.token}`,
        "Content-Type": "application/json"
    });

    const raw = JSON.stringify({ text: postText });

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
            fetchAllPosts();
        } else {
            throw new Error('Error creating post');
        }
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

// Delete a post
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
            fetchAllPosts();
        } else {
            throw new Error('Error deleting post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

// Like a post
async function likePost(_postId) {
    const myHeaders = new Headers({
        "accept": "application/json",
        "Authorization": `Bearer ${loginData.token}`,
        "Content-Type": "application/json"
    });

    const raw = JSON.stringify({ "postId": `${_postId}` });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch(`${apiBaseURLP}/api/likes`, requestOptions);
        if (response.status === 201) {
            fetchAllPosts();
        } else if (response.status === 400) {
            await handleDeleteLike(_postId);
        } else {
            throw new Error('Error liking post');
        }
    } catch (error) {
        console.error(error);
    }
}

// Handle deleting a like
async function handleDeleteLike(_postId) {
    const specificPost = await getSpecificPost(_postId);
    const userLike = specificPost.likes.find(like => like.username === loginData.username);

    if (userLike) {
        deleteLike(userLike._id);
    }
}

// Fetch specific post details
async function getSpecificPost(postId) {
    const myHeaders = new Headers({
        "accept": "application/json",
        "Authorization": `Bearer ${loginData.token}`
    });

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const response = await fetch(`${apiBaseURLP}/api/posts/${postId}`, requestOptions);
    return response.json();
}

// Delete a like
async function deleteLike(_likeId) {
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
            fetchAllPosts();
        } else {
            throw new Error('Error deleting like');
        }
    } catch (error) {
        console.error('Error deleting like:', error);
    }
}

// Render posts with pagination
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

// Create a post element for the UI
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'card blue-background mb-3';

    const postBody = document.createElement('div');
    postBody.className = 'card-body';

    const gravatarUrl = generateGravIcon(post.username);

    const avatarImg = document.createElement('img');
    avatarImg.src = gravatarUrl;
    avatarImg.alt = `${post.username}'s avatar`;
    avatarImg.className = 'avatar-img me-3 img-fluid rounded-circle';
    avatarImg.style.height = '3em';

    const usernameLink = document.createElement('a');
    usernameLink.href = `/profile.html?username=${encodeURIComponent(post.username)}`;
    usernameLink.className = 'card-title h2 text-decoration-none d-inline';
    const displayUsername = post.username.length > 12 ? post.username.slice(0, 12) + '...' : post.username;
    usernameLink.innerText = displayUsername;
    usernameLink.style.cursor = 'pointer';
    usernameLink.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = usernameLink.href;
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
    likeButton.className = 'btn white-button';
    likeButton.innerText = `Like (${post.likes.length})`;
    likeButton.onclick = () => likePost(post._id);

    postFooter.appendChild(likeButton);

    if (post.username === loginData.username) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger mx-2';
        deleteButton.innerText = 'Delete';
        deleteButton.onclick = () => deletePost(post._id);
        postFooter.appendChild(deleteButton);
    }

    const headerDiv = document.createElement('div');
    headerDiv.className = 'd-flex align-items-center mb-2';

    headerDiv.appendChild(avatarImg);
    headerDiv.appendChild(usernameLink);

    postBody.appendChild(headerDiv);
    postBody.appendChild(postText);
    postBody.appendChild(postTime);
    postBody.appendChild(postFooter);
    postElement.appendChild(postBody);

    return postElement;
}

// Update pagination button states and display
function updatePaginationButtons() {
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    prevPageBtn.disabled = currentPage === 0;
    nextPageBtn.disabled = currentPage >= Math.ceil(allPosts.length / 10) - 1;

    document.getElementById('pageIndicator').innerText = `Page ${currentPage + 1}`;
}

// Display logged-in user's username
function getUser() {
    const usernameElement = document.getElementById('profile-Username');
    if (loginData && loginData.username) {
        usernameElement.innerText = loginData.username;
    } else {
        usernameElement.innerText = '';
    }
}

// Fetch and render friends list
async function renderFriendsList() {
    try {
        const randomFriends = await populateFriendsList();
        if (randomFriends) {
            const friendsList = document.getElementById("friends-list");
            friendsList.innerHTML = "";

            randomFriends.forEach((friendName) => {
                const listItem = document.createElement("li");
                listItem.classList.add("list-group-item");

                const usernameLink = document.createElement("a");
                usernameLink.href = `/profile.html?username=${encodeURIComponent(friendName.username)}`;
                usernameLink.className = "card-title h5 text-decoration-none";
                usernameLink.innerText = friendName.username;
                usernameLink.style.cursor = "pointer";

                listItem.appendChild(usernameLink);
                friendsList.appendChild(listItem);
            });
        } else {
            console.log("Failed to fetch users.");
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}
