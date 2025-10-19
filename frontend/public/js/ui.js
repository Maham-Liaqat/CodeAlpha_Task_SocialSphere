import { Notification } from './helpers.js';

class UI {
    constructor(auth, api) {
        this.auth = auth;
        this.api = api;
        this.currentView = 'auth';
        this.notification = new Notification();
        this.initEventListeners();
    }

    initEventListeners() {
        // Event delegation for dynamic content
        document.addEventListener('click', (e) => {
            // Handle navigation
            if (e.target.matches('[data-nav]')) {
                e.preventDefault();
                const view = e.target.getAttribute('data-nav');
                this.handleNavigation(view);
            }

            // Handle auth tabs
            if (e.target.matches('[data-auth-tab]')) {
                this.handleAuthTab(e.target.getAttribute('data-auth-tab'));
            }

            // Handle profile tabs
            if (e.target.matches('[data-profile-tab]')) {
                this.handleProfileTab(e.target.getAttribute('data-profile-tab'));
            }
        });
    }

    // Show authentication screen
    showAuth() {
        this.currentView = 'auth';
        this.renderAuthScreen();
    }

    // Show main application
    showApp() {
        this.currentView = 'feed';
        this.renderNavigation();
        this.renderFeed();
    }

    // Handle navigation
    async handleNavigation(view) {
        this.currentView = view;
        
        switch (view) {
            case 'feed':
                await this.renderFeed();
                break;
            case 'explore':
                await this.renderExplore();
                break;
            case 'profile':
                await this.renderProfile();
                break;
            case 'logout':
                this.handleLogout();
                break;
        }

        this.updateActiveNav();
    }

    updateActiveNav() {
        // Remove active class from all nav items
        document.querySelectorAll('[data-nav]').forEach(item => {
            item.classList.remove('text-blue-500', 'border-blue-500');
        });

        // Add active class to current nav item
        const activeNav = document.querySelector(`[data-nav="${this.currentView}"]`);
        if (activeNav) {
            activeNav.classList.add('text-blue-500', 'border-blue-500');
        }
    }

    // Render methods will be implemented in the next files
    async renderAuthScreen() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = this.getAuthHTML();
    }

    async renderNavigation() {
        const navigation = document.getElementById('navigation');
        navigation.innerHTML = this.getNavigationHTML();
    }

    async renderFeed() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = this.getFeedHTML();
        
        try {
            const feedData = await this.api.getPosts();
            this.renderPosts(feedData.posts);
        } catch (error) {
            this.notification.show('Failed to load feed', 'error');
        }
    }

    async renderExplore() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = this.getExploreHTML();
        
        try {
            const users = await this.api.getExploreUsers();
            this.renderExploreUsers(users);
        } catch (error) {
            this.notification.show('Failed to load users', 'error');
        }
    }

    async renderProfile() {
        const mainContent = document.getElementById('main-content');
        const user = this.auth.getCurrentUserData();
        mainContent.innerHTML = this.getProfileHTML(user);
        
        try {
            const postsData = await this.api.getUserPosts(user._id);
            this.renderProfilePosts(postsData.posts);
        } catch (error) {
            this.notification.show('Failed to load profile', 'error');
        }
    }

    // HTML templates will be implemented in the next files
    getAuthHTML() {
        return `
            <div class="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 fade-in">
                <h2 class="text-2xl font-bold text-center mb-6">Welcome to SocialSphere</h2>
                
                <div class="flex mb-6 border-b">
                    <button data-auth-tab="login" class="flex-1 py-2 font-medium text-center active-tab">Login</button>
                    <button data-auth-tab="register" class="flex-1 py-2 font-medium text-center text-gray-500">Register</button>
                </div>
                
                <div id="auth-forms">
                    ${this.getLoginFormHTML()}
                </div>
            </div>
        `;
    }

    getLoginFormHTML() {
        return `
            <form id="login-form" class="space-y-4">
                <div>
                    <label class="block text-gray-700 mb-2">Username or Email</label>
                    <input type="text" id="login-username" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Password</label>
                    <input type="password" id="login-password" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">Login</button>
            </form>
        `;
    }

    getRegisterFormHTML() {
        return `
            <form id="register-form" class="space-y-4">
                <div>
                    <label class="block text-gray-700 mb-2">Full Name</label>
                    <input type="text" id="register-name" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Username</label>
                    <input type="text" id="register-username" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Email</label>
                    <input type="email" id="register-email" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Password</label>
                    <input type="password" id="register-password" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Bio</label>
                    <textarea id="register-bio" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
                </div>
                <button type="submit" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">Register</button>
            </form>
        `;
    }

    getNavigationHTML() {
        const user = this.auth.getCurrentUserData();
        return `
            <nav class="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-10">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-users text-blue-500 text-2xl"></i>
                    <h1 class="text-xl font-bold text-gray-800">SocialSphere</h1>
                </div>
                
                <div class="flex items-center space-x-4">
                    <button data-nav="feed" class="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition">
                        <i class="fas fa-home"></i>
                        <span class="mobile-hidden">Home</span>
                    </button>
                    <button data-nav="explore" class="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition">
                        <i class="fas fa-search"></i>
                        <span class="mobile-hidden">Explore</span>
                    </button>
                    <button data-nav="profile" class="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition">
                        <i class="fas fa-user"></i>
                        <span class="mobile-hidden">Profile</span>
                    </button>
                    <button data-nav="logout" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                        Logout
                    </button>
                </div>
            </nav>
        `;
    }

    getFeedHTML() {
        const user = this.auth.getCurrentUserData();
        return `
            <div class="fade-in">
                <!-- Create Post Section -->
                <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div class="flex items-start space-x-4">
                        <img src="${user.avatar}" alt="${user.name}" class="w-12 h-12 rounded-full object-cover">
                        <div class="flex-1">
                            <textarea id="post-content" placeholder="What's on your mind?" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows="3"></textarea>
                            <div class="flex justify-between items-center mt-3">
                                <div class="flex space-x-2 text-gray-500">
                                    <button class="hover:text-blue-500 transition">
                                        <i class="fas fa-image"></i>
                                    </button>
                                    <button class="hover:text-blue-500 transition">
                                        <i class="fas fa-video"></i>
                                    </button>
                                    <button class="hover:text-blue-500 transition">
                                        <i class="fas fa-map-marker-alt"></i>
                                    </button>
                                </div>
                                <button id="create-post-btn" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">Post</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Feed Section -->
                <div id="feed-posts" class="space-y-6">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    }

    
    getExploreHTML() {
        return `
            <div class="fade-in">
                <h2 class="text-2xl font-bold mb-6">Discover People</h2>
                <div class="mb-6">
                    <div class="relative">
                        <input type="text" id="search-users" placeholder="Search users..." 
                               class="w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <i class="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
                    </div>
                </div>
                <div id="users-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    }

    getProfileHTML(user) {
        return `
            <div class="fade-in">
                <!-- Profile Header -->
                <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div class="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                        <img src="${user.avatar}" alt="${user.name}" class="w-24 h-24 rounded-full object-cover">
                        <div class="flex-1 text-center md:text-left">
                            <h2 class="text-2xl font-bold">${user.name}</h2>
                            <p class="text-gray-500 mb-2">@${user.username}</p>
                            <p class="text-gray-700 mb-4" id="profile-bio">${user.bio || 'No bio yet'}</p>
                            <div class="flex justify-center md:justify-start space-x-6">
                                <div class="text-center">
                                    <p id="profile-posts-count" class="font-bold text-lg">0</p>
                                    <p class="text-gray-500">Posts</p>
                                </div>
                                <div class="text-center">
                                    <p id="profile-followers-count" class="font-bold text-lg">${user.followers ? user.followers.length : 0}</p>
                                    <p class="text-gray-500">Followers</p>
                                </div>
                                <div class="text-center">
                                    <p id="profile-following-count" class="font-bold text-lg">${user.following ? user.following.length : 0}</p>
                                    <p class="text-gray-500">Following</p>
                                </div>
                            </div>
                        </div>
                        <button id="edit-profile-btn" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                            Edit Profile
                        </button>
                    </div>
                </div>

                <!-- Profile Tabs -->
                <div class="border-b flex space-x-6 mb-6">
                    <button data-profile-tab="posts" class="py-2 font-medium active-tab">Posts</button>
                    <button data-profile-tab="likes" class="py-2 font-medium text-gray-500">Liked Posts</button>
                </div>

                <!-- Posts Container -->
                <div id="profile-posts-container" class="space-y-6">
                    <div class="loading-spinner"></div>
                </div>

                <!-- Liked Posts Container -->
                <div id="profile-likes-container" class="space-y-6 hidden">
                    <!-- Liked posts will be loaded here -->
                </div>
            </div>
        `;
    }

    // Render posts in feed
    renderPosts(posts) {
        const postsContainer = document.getElementById('feed-posts');
        
        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-newspaper text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">No posts yet</p>
                    <p class="text-gray-400">Follow some users to see their posts here!</p>
                </div>
            `;
            return;
        }

        postsContainer.innerHTML = posts.map(post => this.getPostHTML(post)).join('');
        this.attachPostEventListeners();
    }

    getPostHTML(post) {
        const user = this.auth.getCurrentUserData();
        const isLiked = post.likes.includes(user._id);
        const isOwnPost = post.user._id === user._id;
        
        return `
            <div class="post-card bg-white rounded-xl shadow-md p-6" data-post-id="${post._id}">
                <div class="flex items-start space-x-4 mb-4">
                    <img src="${post.user.avatar}" alt="${post.user.name}" class="w-12 h-12 rounded-full object-cover cursor-pointer" data-view-profile="${post.user.username}">
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-bold cursor-pointer hover:text-blue-500 transition" data-view-profile="${post.user.username}">${post.user.name}</h3>
                                <p class="text-gray-500 text-sm">@${post.user.username} · ${this.formatTime(post.createdAt)}</p>
                            </div>
                            ${isOwnPost ? `
                                <button class="text-gray-400 hover:text-red-500 delete-post-btn transition" data-post-id="${post._id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                        <p class="mt-3 text-gray-800 whitespace-pre-wrap">${post.content}</p>
                        ${post.image ? `
                            <img src="${post.image}" alt="Post image" class="mt-3 rounded-lg max-w-full h-auto">
                        ` : ''}
                    </div>
                </div>
                
                <div class="flex justify-between items-center pt-4 border-t">
                    <div class="flex space-x-4">
                        <button class="like-btn flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition" data-post-id="${post._id}">
                            <i class="fas fa-heart ${isLiked ? 'fas' : 'far'}"></i>
                            <span>${post.likes.length}</span>
                        </button>
                        <button class="comment-btn flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition" data-post-id="${post._id}">
                            <i class="far fa-comment"></i>
                            <span>${post.comments ? post.comments.length : 0}</span>
                        </button>
                    </div>
                    ${!isOwnPost ? `
                        <button class="follow-btn ${user.following && user.following.includes(post.user._id) ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'} px-3 py-1 rounded-lg text-sm transition" data-user-id="${post.user._id}">
                            ${user.following && user.following.includes(post.user._id) ? 'Following' : 'Follow'}
                        </button>
                    ` : ''}
                </div>
                
                ${post.comments && post.comments.length > 0 ? `
                    <div class="mt-4 pt-4 border-t">
                        <div class="space-y-3">
                            ${post.comments.slice(0, 2).map(comment => this.getCommentHTML(comment)).join('')}
                        </div>
                        ${post.comments.length > 2 ? `
                            <button class="view-all-comments-btn text-blue-500 text-sm mt-2" data-post-id="${post._id}">
                                View all ${post.comments.length} comments
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    getCommentHTML(comment) {
        return `
            <div class="flex space-x-3">
                <img src="${comment.user.avatar}" alt="${comment.user.name}" class="w-8 h-8 rounded-full object-cover">
                <div class="flex-1">
                    <div class="bg-gray-100 rounded-lg p-3">
                        <p class="font-medium text-sm">${comment.user.name}</p>
                        <p class="text-sm">${comment.content}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${this.formatTime(comment.createdAt)}</p>
                </div>
            </div>
        `;
    }

    // Render explore users
    renderExploreUsers(users) {
        const usersList = document.getElementById('users-list');
        const currentUser = this.auth.getCurrentUserData();

        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="col-span-2 text-center py-8">
                    <p class="text-gray-500">No users found</p>
                </div>
            `;
            return;
        }

        usersList.innerHTML = users.map(user => `
            <div class="profile-card bg-white rounded-xl shadow-md p-4 flex items-center space-x-4">
                <img src="${user.avatar}" alt="${user.name}" class="w-16 h-16 rounded-full object-cover cursor-pointer" data-view-profile="${user.username}">
                <div class="flex-1">
                    <h3 class="font-bold cursor-pointer hover:text-blue-500 transition" data-view-profile="${user.username}">${user.name}</h3>
                    <p class="text-gray-500">@${user.username}</p>
                    <p class="text-sm text-gray-600 mt-1">${user.bio || 'No bio yet'}</p>
                </div>
                <button class="follow-btn ${currentUser.following && currentUser.following.includes(user._id) ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'} px-4 py-2 rounded-lg transition" data-user-id="${user._id}">
                    ${currentUser.following && currentUser.following.includes(user._id) ? 'Following' : 'Follow'}
                </button>
            </div>
        `).join('');

        this.attachUserEventListeners();
    }

    // Render profile posts
    renderProfilePosts(posts) {
        const container = document.getElementById('profile-posts-container');
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-camera text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">No posts yet</p>
                    <p class="text-gray-400">Share your first post above!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = posts.map(post => this.getPostHTML(post)).join('');
        this.attachPostEventListeners();
        
        // Update posts count
        document.getElementById('profile-posts-count').textContent = posts.length;
    }

    // Render liked posts
    async renderLikedPosts() {
        const container = document.getElementById('profile-likes-container');
        const user = this.auth.getCurrentUserData();

        try {
            const likedData = await this.api.getLikedPosts(user._id);
            const posts = likedData.posts;

            if (posts.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-heart text-4xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500 text-lg">No liked posts yet</p>
                        <p class="text-gray-400">Posts you like will appear here</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = posts.map(post => this.getPostHTML(post)).join('');
            this.attachPostEventListeners();
        } catch (error) {
            this.notification.show('Failed to load liked posts', 'error');
        }
    }

    // Attach event listeners to posts
    attachPostEventListeners() {
        // Like buttons
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = e.currentTarget.getAttribute('data-post-id');
                await this.handleLikePost(postId);
            });
        });

        // Comment buttons
        document.querySelectorAll('.comment-btn, .view-all-comments-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.currentTarget.getAttribute('data-post-id');
                this.showPostModal(postId);
            });
        });

        // Follow buttons
        document.querySelectorAll('.follow-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.currentTarget.getAttribute('data-user-id');
                await this.handleFollowUser(userId);
            });
        });

        // Delete post buttons
        document.querySelectorAll('.delete-post-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = e.currentTarget.getAttribute('data-post-id');
                await this.handleDeletePost(postId);
            });
        });

        // View profile
        document.querySelectorAll('[data-view-profile]').forEach(element => {
            element.addEventListener('click', (e) => {
                const username = e.currentTarget.getAttribute('data-view-profile');
                this.viewUserProfile(username);
            });
        });
    }

    // Attach event listeners to users
    attachUserEventListeners() {
        document.querySelectorAll('.follow-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.currentTarget.getAttribute('data-user-id');
                await this.handleFollowUser(userId);
            });
        });

        document.querySelectorAll('[data-view-profile]').forEach(element => {
            element.addEventListener('click', (e) => {
                const username = e.currentTarget.getAttribute('data-view-profile');
                this.viewUserProfile(username);
            });
        });
    }

    // Handle auth tab switching
    handleAuthTab(tab) {
        const authForms = document.getElementById('auth-forms');
        const loginTab = document.querySelector('[data-auth-tab="login"]');
        const registerTab = document.querySelector('[data-auth-tab="register"]');

        if (tab === 'login') {
            authForms.innerHTML = this.getLoginFormHTML();
            loginTab.classList.add('active-tab');
            loginTab.classList.remove('text-gray-500');
            registerTab.classList.remove('active-tab');
            registerTab.classList.add('text-gray-500');
            this.attachAuthFormListeners();
        } else {
            authForms.innerHTML = this.getRegisterFormHTML();
            registerTab.classList.add('active-tab');
            registerTab.classList.remove('text-gray-500');
            loginTab.classList.remove('active-tab');
            loginTab.classList.add('text-gray-500');
            this.attachAuthFormListeners();
        }
    }

    // Handle profile tab switching
    handleProfileTab(tab) {
        const postsTab = document.querySelector('[data-profile-tab="posts"]');
        const likesTab = document.querySelector('[data-profile-tab="likes"]');
        const postsContainer = document.getElementById('profile-posts-container');
        const likesContainer = document.getElementById('profile-likes-container');

        if (tab === 'posts') {
            postsContainer.classList.remove('hidden');
            likesContainer.classList.add('hidden');
            postsTab.classList.add('active-tab');
            postsTab.classList.remove('text-gray-500');
            likesTab.classList.remove('active-tab');
            likesTab.classList.add('text-gray-500');
        } else {
            postsContainer.classList.add('hidden');
            likesContainer.classList.remove('hidden');
            likesTab.classList.add('active-tab');
            likesTab.classList.remove('text-gray-500');
            postsTab.classList.remove('active-tab');
            postsTab.classList.add('text-gray-500');
            this.renderLikedPosts();
        }
    }

    // Format time utility
    formatTime(timestamp) {
        const now = new Date();
        const postTime = new Date(timestamp);
        const diffMs = now - postTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return postTime.toLocaleDateString();
    }

}

export { UI };