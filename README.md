# Capstone-3-Lunchbox Microblog
 A website of a walled gardened lite microblog website, that allows users to create accounts and create posts. They're able to like and unlike posts, along with delete them. The posts can be sorted by username, likes, and most recent (default). Along with posts, there are profiles for users which only features a bio. For the active user they're able to modify their bio, and view other users bios on their profile page.

 The icons for each user are generated dynamically using gravatar.

# The pages include
Index - A page that features a login form and an account creation form. There is also functionality for the main displaying logo, that when clicked will animate and display a blurb of the website for its intended purpose.

Posts - A page that features a sortable list that utilizes pagination to display 10 posts at a time; this list displays posts from all users.

Parks - A page that changes depending on what user you are viewing. If you are viewing your own page, it displays buttons to modify your users data. If you are viewing another users profile, it displays a similar profile card with information populated from retrieving the external users data. Both views display a list of posts that are created by that user specifically; which retains the same filter and pagination functionality.

# Home
<p>
<img src="imgs\readme\Profile.html.jpg" alt="Index Page" width="738">
</p>

# Mountains
<p>
<img src="imgs\readme\Posts.html.jpg" alt="Posts Page" width="738">
</p>

# Parks
<p>
<img src="imgs\readme\Profile.html.jpg" alt="Profile Page" width="738">
</p>

# Interesting Script

<p>
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

        filterUserPosts();
        sortAndRenderPosts(); // Sort and render posts after fetching
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function filterUserPosts() {
    if (window.location.pathname.includes('/profile.html')) {
        let filteredPosts;
        console.log('UrlUsername',urlUsername);

        if (!(urlUsername) || urlUsername == loginData.username) {
             filteredPosts = allPosts.filter(post => post.username === loginData.username);   

        } else if (urlUsername != loginData.username) {
             filteredPosts = allPosts.filter(post => post.username === urlUsername);

        }

        
        allPosts = filteredPosts;
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
</p>

The reason I chose this as my interesting code is because it processes the data inorder to get a subset depending on the user, if it's a local or external user, and then additionally apply the sort ontop of it before displaying them on their respective pages.