/**
 * Profile Manager Class
 * Handles all profile page functionality
 */
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.currentTab = 'posts';
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Initialize profile manager
     */
    async init() {
        // Check authentication
        const user = await this.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        this.currentUser = user;
        await this.loadUserProfile();
        this.setupEventListeners();
        this.renderProfile();
        this.loadTabContent();
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await SupabaseConfig.client.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Load user profile data
     */
    async loadUserProfile() {
        if (!this.currentUser) return;

        try {
            const { data: profile, error } = await SupabaseConfig.client
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            this.userProfile = profile || {
                id: this.currentUser.id,
                email: this.currentUser.email,
                display_name: this.currentUser.user_metadata?.display_name || 'Anonymous',
                username: null,
                bio: null,
                avatar_url: null,
                created_at: this.currentUser.created_at
            };

        } catch (error) {
            console.error('Error loading user profile:', error);
            this.showToast('Error', 'Failed to load profile information', 'error');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.closest('.tab-btn').dataset.tab;
                this.switchTab(tab);
            });
        });

        // Profile editing
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.showEditProfileModal());
        }

        // Avatar upload
        const editAvatarBtn = document.getElementById('edit-avatar-btn');
        const avatarInput = document.getElementById('avatar-input');
        if (editAvatarBtn && avatarInput) {
            editAvatarBtn.addEventListener('click', () => avatarInput.click());
            avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }

        // Banner upload
        const editBannerBtn = document.getElementById('edit-banner-btn');
        const bannerInput = document.getElementById('banner-input');
        if (editBannerBtn && bannerInput) {
            editBannerBtn.addEventListener('click', () => bannerInput.click());
            bannerInput.addEventListener('change', (e) => this.handleBannerUpload(e));
        }

        // Forms
        this.setupFormListeners();
        this.setupModalListeners();

        // Posts filter
        const postsFilter = document.getElementById('posts-filter-select');
        if (postsFilter) {
            postsFilter.addEventListener('change', () => this.loadUserPosts());
        }

        // Character counters
        this.setupCharacterCounters();
    }

    /**
     * Setup form listeners
     */
    setupFormListeners() {
        // Edit profile form
        const editProfileForm = document.getElementById('edit-profile-form');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => this.handleEditProfile(e));
        }

        // Profile settings form
        const profileSettingsForm = document.getElementById('profile-settings-form');
        if (profileSettingsForm) {
            profileSettingsForm.addEventListener('submit', (e) => this.handleProfileSettings(e));
        }

        // Change password form
        const changePasswordForm = document.getElementById('change-password-form');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
        }

        // Danger zone actions
        const changePasswordBtn = document.getElementById('change-password-btn');
        const deleteAccountBtn = document.getElementById('delete-account-btn');

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.showChangePasswordModal());
        }

        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => this.handleDeleteAccount());
        }
    }

    /**
     * Setup modal listeners
     */
    setupModalListeners() {
        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
            element.addEventListener('click', (e) => {
                if (e.target === element) {
                    this.hideModals();
                }
            });
        });

        // Cancel buttons
        document.querySelectorAll('#cancel-edit, #cancel-password').forEach(btn => {
            btn.addEventListener('click', () => this.hideModals());
        });
    }

    /**
     * Setup character counters
     */
    setupCharacterCounters() {
        const bioInputs = ['#edit-bio', '#settings-bio'];
        
        bioInputs.forEach(selector => {
            const input = document.querySelector(selector);
            const counterId = selector.includes('edit') ? 'edit-bio-char-count' : 'bio-char-count';
            const counter = document.getElementById(counterId);
            
            if (input && counter) {
                input.addEventListener('input', () => {
                    counter.textContent = input.value.length;
                });
            }
        });
    }

    /**
     * Render profile information
     */
    renderProfile() {
        if (!this.userProfile) return;

        // Basic info
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileBio = document.getElementById('profile-bio');
        const joinDate = document.getElementById('join-date');
        const profileAvatar = document.getElementById('profile-avatar');

        if (profileName) {
            profileName.textContent = this.userProfile.display_name || 'Anonymous';
        }

        if (profileEmail) {
            profileEmail.textContent = this.userProfile.email || this.currentUser.email;
        }

        if (profileBio) {
            profileBio.textContent = this.userProfile.bio || 'No bio added yet...';
        }

        if (joinDate) {
            const date = new Date(this.userProfile.created_at || this.currentUser.created_at);
            joinDate.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (profileAvatar) {
            if (this.userProfile.avatar_url) {
                profileAvatar.innerHTML = `<img src="${this.userProfile.avatar_url}" alt="Profile">`;
            } else {
                const initials = this.getInitials(this.userProfile.display_name || 'U');
                profileAvatar.innerHTML = `<span>${initials}</span>`;
            }
        }

        // Load stats
        this.loadProfileStats();
    }

    /**
     * Load profile statistics
     */
    async loadProfileStats() {
        try {
            // Load posts count
            const { count: postsCount } = await SupabaseConfig.client
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', this.currentUser.id)
                .eq('published', true);

            // Load total likes count
            const { data: likesData } = await SupabaseConfig.client
                .from('posts')
                .select('likes_count')
                .eq('author_id', this.currentUser.id)
                .eq('published', true);

            const totalLikes = likesData?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;

            // Load total views count
            const { data: viewsData } = await SupabaseConfig.client
                .from('posts')
                .select('views_count')
                .eq('author_id', this.currentUser.id)
                .eq('published', true);

            const totalViews = viewsData?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0;

            // Update UI
            const postsCountEl = document.getElementById('posts-count');
            const likesCountEl = document.getElementById('likes-count');
            const viewsCountEl = document.getElementById('views-count');

            if (postsCountEl) postsCountEl.textContent = postsCount || 0;
            if (likesCountEl) likesCountEl.textContent = totalLikes;
            if (viewsCountEl) viewsCountEl.textContent = totalViews;

        } catch (error) {
            console.error('Error loading profile stats:', error);
        }
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        this.loadTabContent();
    }

    /**
     * Load content for current tab
     */
    async loadTabContent() {
        switch (this.currentTab) {
            case 'posts':
                await this.loadUserPosts();
                break;
            case 'saved':
                await this.loadSavedPosts();
                break;
            case 'liked':
                await this.loadLikedPosts();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    /**
     * Load user's posts
     */
    async loadUserPosts() {
        const container = document.getElementById('user-posts');
        if (!container) return;

        this.showLoading(container);

        try {
            const filter = document.getElementById('posts-filter-select')?.value || 'all';
            let query = SupabaseConfig.client
                .from('posts')
                .select('*')
                .eq('author_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (filter === 'published') {
                query = query.eq('published', true);
            } else if (filter === 'draft') {
                query = query.eq('published', false);
            }

            const { data: posts, error } = await query;
            if (error) throw error;

            this.renderPosts(posts, container);

        } catch (error) {
            console.error('Error loading user posts:', error);
            this.showError(container, 'Failed to load posts');
        }
    }

    /**
     * Load saved posts
     */
    async loadSavedPosts() {
        const container = document.getElementById('saved-posts');
        if (!container) return;

        this.showLoading(container);

        try {
            const { data: savedPosts, error } = await SupabaseConfig.client
                .from('saved_posts')
                .select(`
                    post_id,
                    posts (
                        *,
                        profiles (
                            display_name,
                            avatar_url
                        )
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const posts = savedPosts?.map(sp => sp.posts) || [];
            this.renderPosts(posts, container);

        } catch (error) {
            console.error('Error loading saved posts:', error);
            this.showError(container, 'Failed to load saved posts');
        }
    }

    /**
     * Load liked posts
     */
    async loadLikedPosts() {
        const container = document.getElementById('liked-posts');
        if (!container) return;

        this.showLoading(container);

        try {
            const { data: likedPosts, error } = await SupabaseConfig.client
                .from('likes')
                .select(`
                    post_id,
                    posts (
                        *,
                        profiles (
                            display_name,
                            avatar_url
                        )
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const posts = likedPosts?.map(lp => lp.posts) || [];
            this.renderPosts(posts, container);

        } catch (error) {
            console.error('Error loading liked posts:', error);
            this.showError(container, 'Failed to load liked posts');
        }
    }

    /**
     * Load settings
     */
    loadSettings() {
        if (!this.userProfile) return;

        // Fill form fields
        const displayNameInput = document.getElementById('settings-display-name');
        const usernameInput = document.getElementById('settings-username');
        const bioInput = document.getElementById('settings-bio');
        const bioCharCount = document.getElementById('bio-char-count');

        if (displayNameInput) {
            displayNameInput.value = this.userProfile.display_name || '';
        }

        if (usernameInput) {
            usernameInput.value = this.userProfile.username || '';
        }

        if (bioInput) {
            bioInput.value = this.userProfile.bio || '';
            if (bioCharCount) {
                bioCharCount.textContent = bioInput.value.length;
            }
        }
    }

    /**
     * Render posts grid
     */
    renderPosts(posts, container) {
        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>No posts yet</h3>
                    <p>No posts found in this category.</p>
                </div>
            `;
            return;
        }

        const postsHTML = posts.map(post => this.createPostCard(post)).join('');
        container.innerHTML = `<div class="posts-grid">${postsHTML}</div>`;

        // Add click listeners
        container.querySelectorAll('.post-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                window.location.href = `post.html?id=${posts[index].id}`;
            });
        });
    }

    /**
     * Create post card HTML
     */
    createPostCard(post) {
        const authorName = post.profiles?.display_name || 'Anonymous';
        const createdAt = new Date(post.created_at).toLocaleDateString('en-US');
        const excerpt = post.excerpt || this.generateExcerpt(post.content);

        return `
            <div class="post-card">
                ${post.featured_image ? `
                    <div class="post-card-image">
                        <img src="${post.featured_image}" alt="${post.title}" loading="lazy">
                    </div>
                ` : ''}
                <div class="post-card-content">
                    <h3 class="post-card-title">${post.title}</h3>
                    <p class="post-card-excerpt">${excerpt}</p>
                    <div class="post-card-meta">
                        <div class="post-card-date">
                            <i class="fas fa-calendar"></i>
                            <span>${createdAt}</span>
                        </div>
                        <div class="post-card-stats">
                            <span>
                                <i class="fas fa-heart"></i>
                                ${post.likes_count || 0}
                            </span>
                            <span>
                                <i class="fas fa-eye"></i>
                                ${post.views_count || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show edit profile modal
     */
    showEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (!modal || !this.userProfile) return;

        // Fill form
        const displayNameInput = document.getElementById('edit-display-name');
        const usernameInput = document.getElementById('edit-username');
        const bioInput = document.getElementById('edit-bio');
        const bioCharCount = document.getElementById('edit-bio-char-count');

        if (displayNameInput) {
            displayNameInput.value = this.userProfile.display_name || '';
        }

        if (usernameInput) {
            usernameInput.value = this.userProfile.username || '';
        }

        if (bioInput) {
            bioInput.value = this.userProfile.bio || '';
            if (bioCharCount) {
                bioCharCount.textContent = bioInput.value.length;
            }
        }

        modal.classList.add('show');
    }

    /**
     * Show change password modal
     */
    showChangePasswordModal() {
        const modal = document.getElementById('change-password-modal');
        if (!modal) return;

        // Clear form
        const form = modal.querySelector('form');
        if (form) form.reset();

        modal.classList.add('show');
    }

    /**
     * Hide all modals
     */
    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    /**
     * Handle edit profile form submission
     */
    async handleEditProfile(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const displayName = formData.get('display_name').trim();
        const username = formData.get('username').trim();
        const bio = formData.get('bio').trim();

        if (!displayName) {
            this.showToast('Error', 'Full name is required', 'error');
            return;
        }

        try {
            this.showLoadingOverlay();

            const updateData = {
                display_name: displayName,
                bio: bio || null,
                updated_at: new Date().toISOString()
            };

            if (username) {
                updateData.username = username;
            }

            const { error } = await SupabaseConfig.client
                .from('profiles')
                .upsert(updateData)
                .eq('id', this.currentUser.id);

            if (error) throw error;

            // Update local data
            this.userProfile = { ...this.userProfile, ...updateData };

            this.hideModals();
            this.renderProfile();
            this.showToast('Success', 'Profile updated successfully', 'success');

        } catch (error) {
            console.error('Error updating profile:', error);
            this.showToast('Error', 'Failed to update profile', 'error');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    /**
     * Handle profile settings form submission
     */
    async handleProfileSettings(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const displayName = formData.get('display_name').trim();
        const username = formData.get('username').trim();
        const bio = formData.get('bio').trim();

        try {
            this.showLoadingOverlay();

            const updateData = {
                display_name: displayName || this.userProfile.display_name,
                username: username || null,
                bio: bio || null,
                updated_at: new Date().toISOString()
            };

            const { error } = await SupabaseConfig.client
                .from('profiles')
                .upsert(updateData)
                .eq('id', this.currentUser.id);

            if (error) throw error;

            // Update local data
            this.userProfile = { ...this.userProfile, ...updateData };

            this.renderProfile();
            this.showToast('Success', 'Settings saved successfully', 'success');

        } catch (error) {
            console.error('Error updating profile settings:', error);
            this.showToast('Error', 'Failed to save settings', 'error');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    /**
     * Handle change password form submission
     */
    async handleChangePassword(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const newPassword = formData.get('new_password');
        const confirmPassword = formData.get('confirm_password');

        if (newPassword !== confirmPassword) {
            this.showToast('Error', 'New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showToast('Error', 'Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            this.showLoadingOverlay();

            const { error } = await SupabaseConfig.client.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            this.hideModals();
            this.showToast('Success', 'Password changed successfully', 'success');

        } catch (error) {
            console.error('Error changing password:', error);
            this.showToast('Error', 'Failed to change password', 'error');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    /**
     * Handle avatar upload
     */
    async handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showToast('Error', 'Please select a valid image file', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB
            this.showToast('Error', 'File size must be less than 2MB', 'error');
            return;
        }

        try {
            this.showLoadingOverlay();

            const fileExt = file.name.split('.').pop();
            const fileName = `${this.currentUser.id}/avatar.${fileExt}`;

            const { error: uploadError } = await SupabaseConfig.client.storage
                .from('avatars')
                .upload(fileName, file, {
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data } = SupabaseConfig.client.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const avatarUrl = data.publicUrl;

            // Update profile
            const { error: updateError } = await SupabaseConfig.client
                .from('profiles')
                .upsert({
                    id: this.currentUser.id,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                });

            if (updateError) throw updateError;

            this.userProfile.avatar_url = avatarUrl;
            this.renderProfile();
            this.showToast('Success', 'Profile picture updated', 'success');

        } catch (error) {
            console.error('Error uploading avatar:', error);
            this.showToast('Error', 'Failed to upload profile picture', 'error');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    /**
     * Handle banner upload
     */
    async handleBannerUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showToast('Error', 'Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            this.showToast('Error', 'File size must be less than 5MB', 'error');
            return;
        }

        try {
            this.showLoadingOverlay();

            const fileExt = file.name.split('.').pop();
            const fileName = `${this.currentUser.id}/banner.${fileExt}`;

            const { error: uploadError } = await SupabaseConfig.client.storage
                .from('images')
                .upload(fileName, file, {
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data } = SupabaseConfig.client.storage
                .from('images')
                .getPublicUrl(fileName);

            const bannerUrl = data.publicUrl;

            // Update banner background
            const profileBanner = document.querySelector('.profile-banner');
            if (profileBanner) {
                profileBanner.style.backgroundImage = `url(${bannerUrl})`;
                profileBanner.style.backgroundSize = 'cover';
                profileBanner.style.backgroundPosition = 'center';
            }

            this.showToast('Success', 'Banner picture updated', 'success');

        } catch (error) {
            console.error('Error uploading banner:', error);
            this.showToast('Error', 'Failed to upload banner picture', 'error');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    /**
     * Handle delete account
     */
    async handleDeleteAccount() {
        const confirmed = confirm(
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
        );

        if (!confirmed) return;

        const doubleConfirmed = confirm(
            'Last warning: Are you absolutely sure you want to permanently delete your account?'
        );

        if (!doubleConfirmed) return;

        try {
            this.showLoadingOverlay();
            
            // Note: This would require admin privileges
            // For now, just sign out the user
            await SupabaseConfig.client.auth.signOut();
            this.showToast('Info', 'Please contact an administrator to delete your account', 'info');
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Error deleting account:', error);
            this.showToast('Error', 'Failed to delete account', 'error');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    /**
     * Show loading state
     */
    showLoading(container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading...</p>
            </div>
        `;
    }

    /**
     * Show error state
     */
    showError(container, message) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Show loading overlay
     */
    showLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Show toast notification
     */
    showToast(title, message, type = 'success') {
        // Use existing toast system from auth.js or create simple alert
        if (window.authManager && typeof window.authManager.showToast === 'function') {
            window.authManager.showToast(title, message, type);
        } else {
            alert(`${title}: ${message}`);
        }
    }

    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    /**
     * Generate excerpt from content
     */
    generateExcerpt(content, maxLength = 150) {
        if (!content) return '';
        
        // Remove HTML tags
        const textContent = content.replace(/<[^>]*>/g, '');
        
        if (textContent.length <= maxLength) {
            return textContent;
        }
        
        return textContent.substring(0, maxLength).trim() + '...';
    }
}

// Export for global use
window.ProfileManager = ProfileManager; 