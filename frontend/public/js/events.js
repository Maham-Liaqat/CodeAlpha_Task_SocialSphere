// This file contains all the event handlers for the UI class
// Adding methods to UI class prototype for better organization

// Auth form event listeners
UI.prototype.attachAuthFormListeners = function() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });
    }
};

// Handle login
UI.prototype.handleLogin = async function() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        await this.auth.login({ username, password });
        this.notification.show('Login successful!', 'success');
        this.showApp();
    } catch (error) {
        this.notification.show(error.message, 'error');
    }
};

// Handle register
UI.prototype.handleRegister = async function() {
    const name = document.getElementById('register-name').value;
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const bio = document.getElementById('register-bio').value;

    try {
        await this.auth.register({ name, username, email, password, bio });
        this.notification.show('Registration successful!', 'success');
        this.showApp();
    } catch (error) {
        this.notification.show(error.message, 'error');
    }
};

// Handle logout
UI.prototype.handleLogout = function() {
    this.auth.logout();
    this.notification.show('Logged out successfully', 'info');
    this.showAuth();
};

// Handle create post
UI.prototype.attachCreatePostListener = function() {
    const createPostBtn = document.getElementById('create-post-btn');
    const postContent = document.getElementById('post-content');

    if (createPostBtn) {
        createPostBtn.addEventListener('click', async () => {
            await this.handleCreatePost();
        });

        // Ctrl+Enter to post
        postContent.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.handleCreatePost();
            }
        });
    }
};

UI.prototype.handleCreatePost = async function() {
    const content = document.getElementById('post-content').value.trim();

    if (!content) {
        this.notification.show('Post content cannot be empty', 'error');
        return;
    }

    try {
        await this.api.createPost({ content });
        document.getElementById('post-content').value = '';
        this.notification.show('Post created successfully!', 'success');
        
        // Refresh feed
        if (this.currentView === 'feed') {
            await this.renderFeed();
        } else if (this.currentView === 'profile') {
            await this.renderProfile();
        }
    } catch (error) {
        this.notification.show(error.message, 'error');
    }
};

// Handle like post
UI.prototype.handleLikePost = async function(postId) {
    try {
        const result = await this.api.likePost(postId);
        
        // Update UI
        const likeBtn = document.querySelector(`.like-btn[data-post-id="${postId}"]`);
        const likeCount = likeBtn.querySelector('span');
        
        if (result.liked) {
            likeBtn.classList.add('text-red-500');
            likeBtn.classList.remove('text-gray-500');
            likeBtn.querySelector('i').classList.replace('far', 'fas');
        } else {
            likeBtn.classList.remove('text-red-500');
            likeBtn.classList.add('text-gray-500');
            likeBtn.querySelector('i').classList.replace('fas', 'far');
        }
        
        likeCount.textContent = result.likeCount;
    } catch (error) {
        this.notification.show(error.message, 'error');
    }
};

// Handle follow user
UI.prototype.handleFollowUser = async function(userId) {
    try {
        const result = await this.api.followUser(userId);
        
        // Update all follow buttons for this user
        const followBtns = document.querySelectorAll(`.follow-btn[data-user-id="${userId}"]`);
        
        followBtns.forEach(btn => {
            if (result.following) {
                btn.textContent = 'Following';
                btn.classList.remove('bg-blue-500', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-800');
            } else {
                btn.textContent = 'Follow';
                btn.classList.remove('bg-gray-200', 'text-gray-800');
                btn.classList.add('bg-blue-500', 'text-white');
            }
        });

        // Update follower count if on profile
        if (this.currentView === 'profile') {
            const followersCount = document.getElementById('profile-followers-count');
            if (followersCount) {
                followersCount.textContent = result.followerCount;
            }
        }

        const action = result.following ? 'followed' : 'unfollowed';
        this.notification.show(`User ${action} successfully`, 'success');
    } catch (error) {
        this.notification.show(error.message, 'error');
    }
};

// Handle delete post
UI.prototype.handleDeletePost = async function(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    try {
        await this.api.deletePost(postId);
        this.notification.show('Post deleted successfully', 'success');
        
        // Remove post from UI
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            postElement.remove();
        }

        // Update posts count
        if (this.currentView === 'profile') {
            const postsCount = document.getElementById('profile-posts-count');
            if (postsCount) {
                postsCount.textContent = parseInt(postsCount.textContent) - 1;
            }
        }
    } catch (error) {
        this.notification.show(error.message, 'error');
    }
};

// Show post modal with comments
UI.prototype.showPostModal = async function(postId) {
    try {
        const post = await this.api.getPost(postId);
        const modalHTML = this.getPostModalHTML(post);
        
        // Create or update modal
        let modalContainer = document.getElementById('modals-container');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'modals-container';
            document.body.appendChild(modalContainer);
        }
        
        modalContainer.innerHTML = modalHTML;
        
        // Show modal
        const modal = document.getElementById('post-modal');
        modal.classList.remove('hidden');
        
        // Attach modal event listeners
        this.attachModalEventListeners(postId);
    } catch (error) {
        this.notification.show('Failed to load post', 'error');
    }
};

UI.prototype.getPostModalHTML = function(post) {
    const user = this.auth.getCurrentUserData();
    const isLiked = post.likes.includes(user._id);
    
    return `
        <div id="post-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">Post</h3>
                        <button id="close-modal" class="text-gray-500 hover:text-gray-700 transition">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- Post Content -->
                    <div class="mb-6">
                        <div class="flex items-start space-x-4 mb-4">
                            <img src="${post.user.avatar}" alt="${post.user.name}" class="w-12 h-12 rounded-full object-cover">
                            <div class="flex-1">
                                <h3 class="font-bold">${post.user.name}</h3>
                                <p class="text-gray-500 text-sm">@${post.user.username} · ${this.formatTime(post.createdAt)}</p>
                                <p class="mt-3 text-gray-800 whitespace-pre-wrap">${post.content}</p>
                            </div>
                        </div>
                        
                        <div class="flex space-x-4 mb-4">
                            <button class="like-btn flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition" data-post-id="${post._id}">
                                <i class="fas fa-heart ${isLiked ? 'fas' : 'far'}"></i>
                                <span>${post.likes.length}</span>
                            </button>
                            <button class="flex items-center space-x-1 text-gray-500">
                                <i class="far fa-comment"></i>
                                <span>${post.comments.length}</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Comments Section -->
                    <div class="border-t pt-4">
                        <h4 class="font-bold mb-4">Comments (${post.comments.length})</h4>
                        
                        <div id="modal-comments" class="space-y-4 mb-4 max-h-96 overflow-y-auto custom-scrollbar">
                            ${post.comments.map(comment => this.getModalCommentHTML(comment)).join('')}
                        </div>
                        
                        <!-- Add Comment -->
                        <div class="flex space-x-3 mt-4">
                            <img src="${user.avatar}" alt="${user.name}" class="w-10 h-10 rounded-full object-cover">
                            <div class="flex-1">
                                <input type="text" id="comment-input" placeholder="Write a comment..." 
                                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <button id="add-comment-btn" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition" data-post-id="${post._id}">
                                    Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

UI.prototype.getModalCommentHTML = function(comment) {
    const user = this.auth.getCurrentUserData();
    const isOwnComment = comment.user._id === user._id;
    
    return `
        <div class="flex space-x-3 group">
            <img src="${comment.user.avatar}" alt="${comment.user.name}" class="w-10 h-10 rounded-full object-cover">
            <div class="flex-1">
                <div class="bg-gray-100 rounded-lg p-3 relative">
                    <p class="font-medium">${comment.user.name}</p>
                    <p>${comment.content}</p>
                    ${isOwnComment ? `
                        <button class="delete-comment-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition" data-comment-id="${comment._id}">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    ` : ''}
                </div>
                <p class="text-xs text-gray-500 mt-1">${this.formatTime(comment.createdAt)}</p>
            </div>
        </div>
    `;
};

UI.prototype.attachModalEventListeners = function(postId) {
    // Close modal
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('post-modal').classList.add('hidden');
    });

    // Close modal when clicking outside
    document.getElementById('post-modal').addEventListener('click', (e) => {
        if (e.target.id === 'post-modal') {
            e.target.classList.add('hidden');
        }
    });

    // Like post in modal
    const modalLikeBtn = document.querySelector('#post-modal .like-btn');
    if (modalLikeBtn) {
        modalLikeBtn.addEventListener('click', async () => {
            await this.handleLikePost(postId);
            // Refresh modal to update like count
            this.showPostModal(postId);
        });
    }

    // Add comment
    const addCommentBtn = document.getElementById('add-comment-btn');
    const commentInput = document.getElementById('comment-input');
    
    addCommentBtn.addEventListener('click', async () => {
        await this.handleAddComment(postId);
    });

    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            this.handleAddComment(postId);
        }
    });

    // Delete comment
    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const commentId = e.currentTarget.getAttribute('data-comment-id');
            await this.handleDeleteComment(commentId, postId);
        });
    });
};

UI.prototype.handleAddComment = async function(postId) {
    const commentInput = document.getElementById('comment-input');
    const content = commentInput.value.trim();

    if (!content) {
        this.notification.show('Comment cannot be empty', 'error');
        return;
    }

    try {
        await this.api.createComment(postId, content);
        commentInput.value = '';
        this.notification.show('Comment added!', 'success');
        
        // Refresh modal to show new comment
        this.showPostModal(postId);
        
        // Refresh feed if on feed view
        if (this.currentView === 'feed') {
            await this.renderFeed();
        }
    } catch (error) {
        this.notification.show(error.message, 'error');
    }
};

UI.prototype.handleDeleteComment = async function(commentId, postId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    try {
        await this.api.deleteComment(commentId);
        this.notification.show('Comment deleted', 'success');
        
        // Refresh modal
        this.showPostModal(postId);
    } catch (error) {
        this.notification.show(error.message, 'error');
    }
};

// View user profile
UI.prototype.viewUserProfile = async function(username) {
    // This would navigate to the user's profile
    // For now, we'll just show a notification
    this.notification.show(`Viewing profile: @${username}`, 'info');
    
    // In a real app, you might:
    // 1. Fetch user data
    // 2. Render profile page
    // 3. Update navigation state
};

// Search users
UI.prototype.attachSearchListener = function() {
    const searchInput = document.getElementById('search-users');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                // Show explore users if query is too short
                this.renderExplore();
                return;
            }
            
            searchTimeout = setTimeout(async () => {
                await this.handleSearchUsers(query);
            }, 500);
        });
    }
};

UI.prototype.handleSearchUsers = async function(query) {
    try {
        const users = await this.api.searchUsers(query);
        this.renderExploreUsers(users);
    } catch (error) {
        this.notification.show('Search failed', 'error');
    }
};