/**
 * Authentication Module
 * 
 * Handles user authentication, registration, login, logout,
 * and session management using Supabase Auth.
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authModal = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    /**
     * Initialize the authentication manager
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Get DOM elements
            this.authModal = document.getElementById('auth-modal');
            this.authContainer = document.getElementById('auth-container');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Check current auth state
            await this.checkAuthState();
            
            // Listen for auth state changes
            this.setupAuthStateListener();
            
            this.isInitialized = true;
            console.log('Auth manager initialized successfully');
            
        } catch (error) {
            console.error('Error initializing auth manager:', error);
        }
    }
    
    /**
     * Set up event listeners for authentication
     */
    setupEventListeners() {
        // Login/Register buttons
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const modalClose = document.getElementById('modal-close');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showAuthModal('login'));
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showAuthModal('register'));
        }
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideAuthModal());
        }
        
        // Close modal on backdrop click
        if (this.authModal) {
            this.authModal.addEventListener('click', (e) => {
                if (e.target === this.authModal) {
                    this.hideAuthModal();
                }
            });
        }
        
        // User dropdown
        const userAvatar = document.getElementById('user-avatar');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        if (userAvatar && dropdownMenu) {
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }
    
    /**
     * Listen for auth state changes
     */
    setupAuthStateListener() {
        window.addEventListener('authStateChange', (event) => {
            const { event: authEvent, session } = event.detail;
            
            if (authEvent === 'SIGNED_IN' && session) {
                this.handleSignIn(session.user);
            } else if (authEvent === 'SIGNED_OUT') {
                this.handleSignOut();
            }
        });
    }
    
    /**
     * Check current authentication state
     */
    async checkAuthState() {
        try {
            const user = await SupabaseConfig.getCurrentUser();
            if (user) {
                await this.handleSignIn(user);
            } else {
                this.handleSignOut();
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            this.handleSignOut();
        }
    }
    
    /**
     * Show authentication modal
     * @param {string} mode - 'login' or 'register'
     */
    showAuthModal(mode = 'login') {
        if (!this.authModal || !this.authContainer) return;
        
        this.authContainer.innerHTML = this.createAuthForm(mode);
        this.setupAuthFormListeners(mode);
        this.authModal.classList.add('show');
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = this.authContainer.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    /**
     * Hide authentication modal
     */
    hideAuthModal() {
        if (this.authModal) {
            this.authModal.classList.remove('show');
            setTimeout(() => {
                if (this.authContainer) {
                    this.authContainer.innerHTML = '';
                }
            }, 300);
        }
    }
    
    /**
     * Create authentication form HTML
     * @param {string} mode - 'login' or 'register'
     * @returns {string} - Form HTML
     */
    createAuthForm(mode) {
        const isLogin = mode === 'login';
        
        return `
            <div class="auth-form">
                <div class="auth-header">
                    <h2>${isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>${isLogin ? 'Sign in to your account' : 'Join our blogging community'}</p>
                </div>
                
                <form id="auth-form" class="auth-form-fields">
                    ${!isLogin ? `
                        <div class="form-group">
                            <label for="display-name" class="form-label">Display Name</label>
                            <input type="text" id="display-name" class="form-input" required>
                            <div class="form-error" id="display-name-error"></div>
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" class="form-input" required>
                        <div class="form-error" id="email-error"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" id="password" class="form-input" required>
                        <div class="form-error" id="password-error"></div>
                        ${!isLogin ? '<small>Password must be at least 6 characters long</small>' : ''}
                    </div>
                    
                    ${!isLogin ? `
                        <div class="form-group">
                            <label for="confirm-password" class="form-label">Confirm Password</label>
                            <input type="password" id="confirm-password" class="form-input" required>
                            <div class="form-error" id="confirm-password-error"></div>
                        </div>
                    ` : ''}
                    
                    <button type="submit" class="btn btn-primary btn-large" id="auth-submit" style="width: 100%;">
                        ${isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
                
                <div class="auth-footer">
                    <p>
                        ${isLogin ? "Don't have an account?" : "Already have an account?"}
                        <a href="#" id="auth-switch">
                            ${isLogin ? 'Create one' : 'Sign in'}
                        </a>
                    </p>
                    
                    ${isLogin ? `
                        <p>
                            <a href="#" id="forgot-password">Forgot your password?</a>
                        </p>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Set up authentication form event listeners
     * @param {string} mode - 'login' or 'register'
     */
    setupAuthFormListeners(mode) {
        const form = document.getElementById('auth-form');
        const switchLink = document.getElementById('auth-switch');
        const forgotPasswordLink = document.getElementById('forgot-password');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (mode === 'login') {
                    this.handleLogin(form);
                } else {
                    this.handleRegister(form);
                }
            });
        }
        
        if (switchLink) {
            switchLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal(mode === 'login' ? 'register' : 'login');
            });
        }
        
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
        
        // Real-time validation
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input, mode));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    /**
     * Handle user login
     * @param {HTMLFormElement} form - Login form
     */
    async handleLogin(form) {
        const submitBtn = form.querySelector('#auth-submit');
        const email = form.querySelector('#email').value.trim();
        const password = form.querySelector('#password').value;
        
        // Validate inputs
        if (!this.validateLoginForm(email, password)) return;
        
        try {
            this.setSubmitButtonLoading(submitBtn, true);
            this.clearAllErrors();
            
            const { data, error } = await SupabaseConfig.client.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Success is handled by auth state change listener
            this.hideAuthModal();
            this.showToast('Welcome back!', 'You have successfully signed in.', 'success');
            
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = SupabaseConfig.handleError(error, 'Login');
            this.showFormError('email', errorMessage);
            
        } finally {
            this.setSubmitButtonLoading(submitBtn, false);
        }
    }
    
    /**
     * Handle user registration
     * @param {HTMLFormElement} form - Registration form
     */
    async handleRegister(form) {
        const submitBtn = form.querySelector('#auth-submit');
        const displayName = form.querySelector('#display-name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const password = form.querySelector('#password').value;
        const confirmPassword = form.querySelector('#confirm-password').value;
        
        // Validate inputs
        if (!this.validateRegisterForm(displayName, email, password, confirmPassword)) return;
        
        try {
            this.setSubmitButtonLoading(submitBtn, true);
            this.clearAllErrors();
            
            const { data, error } = await SupabaseConfig.client.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName
                    }
                }
            });
            
            if (error) throw error;
            
            // Create user profile
            if (data.user) {
                await this.createUserProfile(data.user, displayName);
            }
            
            this.hideAuthModal();
            this.showToast(
                'Account Created!', 
                'Please check your email to verify your account.', 
                'success'
            );
            
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = SupabaseConfig.handleError(error, 'Registration');
            this.showFormError('email', errorMessage);
            
        } finally {
            this.setSubmitButtonLoading(submitBtn, false);
        }
    }
    
    /**
     * Create user profile in database
     * @param {Object} user - User object from auth
     * @param {string} displayName - User's display name
     */
    async createUserProfile(user, displayName) {
        try {
            const { error } = await SupabaseConfig.client
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    display_name: displayName,
                    avatar_url: null,
                    bio: null,
                    created_at: new Date().toISOString()
                });
            
            if (error) throw error;
            
        } catch (error) {
            console.error('Error creating user profile:', error);
            // Don't throw here as the user is already created
        }
    }
    
    /**
     * Handle forgot password
     */
    async handleForgotPassword() {
        const email = prompt('Please enter your email address:');
        if (!email) return;
        
        try {
            const { error } = await SupabaseConfig.client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });
            
            if (error) throw error;
            
            this.hideAuthModal();
            this.showToast(
                'Reset Email Sent',
                'Please check your email for password reset instructions.',
                'success'
            );
            
        } catch (error) {
            console.error('Password reset error:', error);
            const errorMessage = SupabaseConfig.handleError(error, 'Password reset');
            alert(errorMessage);
        }
    }
    
    /**
     * Handle user logout
     */
    async logout() {
        try {
            const { error } = await SupabaseConfig.client.auth.signOut();
            if (error) throw error;
            
            this.showToast('Goodbye!', 'You have been signed out successfully.', 'success');
            
        } catch (error) {
            console.error('Logout error:', error);
            this.showToast('Error', 'Failed to sign out. Please try again.', 'error');
        }
    }
    
    /**
     * Handle successful sign in
     * @param {Object} user - User object
     */
    async handleSignIn(user) {
        this.currentUser = user;
        
        // Get user profile
        const profile = await SupabaseConfig.getUserProfile(user.id);
        if (profile) {
            this.currentUser.profile = profile;
        }
        
        this.updateUIForSignedInUser();
    }
    
    /**
     * Handle sign out
     */
    handleSignOut() {
        this.currentUser = null;
        this.updateUIForSignedOutUser();
    }
    
    /**
     * Update UI for signed in user
     */
    updateUIForSignedInUser() {
        const navAuth = document.getElementById('nav-auth');
        const navUser = document.getElementById('nav-user');
        const userAvatar = document.getElementById('user-avatar');
        
        if (navAuth) navAuth.classList.add('hidden');
        if (navUser) navUser.classList.remove('hidden');
        
        // Update user avatar and name
        if (userAvatar && this.currentUser) {
            const displayName = this.currentUser.profile?.display_name || 
                              this.currentUser.user_metadata?.display_name ||
                              this.currentUser.email;
            
            userAvatar.innerHTML = this.getAvatarHTML(displayName);
        }
        
        // Update any user-specific elements
        this.updateUserElements();
    }
    
    /**
     * Update UI for signed out user
     */
    updateUIForSignedOutUser() {
        const navAuth = document.getElementById('nav-auth');
        const navUser = document.getElementById('nav-user');
        
        if (navAuth) navAuth.classList.remove('hidden');
        if (navUser) navUser.classList.add('hidden');
        
        // Update any user-specific elements
        this.updateUserElements();
    }
    
    /**
     * Update user-specific elements
     */
    updateUserElements() {
        // Update comment form visibility
        const commentForm = document.getElementById('comment-form-container');
        const loginToComment = document.getElementById('login-to-comment');
        
        if (commentForm && loginToComment) {
            if (this.currentUser) {
                commentForm.classList.remove('hidden');
                loginToComment.classList.add('hidden');
                
                // Update comment user name
                const commentUserName = document.getElementById('comment-user-name');
                if (commentUserName) {
                    const displayName = this.currentUser.profile?.display_name || 
                                      this.currentUser.user_metadata?.display_name ||
                                      'Anonymous';
                    commentUserName.textContent = displayName;
                }
            } else {
                commentForm.classList.add('hidden');
                loginToComment.classList.remove('hidden');
            }
        }
    }
    
    /**
     * Get avatar HTML
     * @param {string} displayName - User's display name
     * @returns {string} - Avatar HTML
     */
    getAvatarHTML(displayName) {
        const initials = this.getInitials(displayName);
        return `<span>${initials}</span>`;
    }
    
    /**
     * Get user initials
     * @param {string} name - User's name
     * @returns {string} - User initials
     */
    getInitials(name) {
        if (!name) return 'U';
        
        const words = name.split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    /**
     * Validate login form
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {boolean} - Is valid
     */
    validateLoginForm(email, password) {
        let isValid = true;
        
        if (!email) {
            this.showFormError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFormError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!password) {
            this.showFormError('password', 'Password is required');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Validate registration form
     * @param {string} displayName - Display name
     * @param {string} email - Email address
     * @param {string} password - Password
     * @param {string} confirmPassword - Confirm password
     * @returns {boolean} - Is valid
     */
    validateRegisterForm(displayName, email, password, confirmPassword) {
        let isValid = true;
        
        if (!displayName || displayName.length < 2) {
            this.showFormError('display-name', 'Display name must be at least 2 characters');
            isValid = false;
        }
        
        if (!email) {
            this.showFormError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFormError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!password) {
            this.showFormError('password', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showFormError('password', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            this.showFormError('confirm-password', 'Passwords do not match');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Validate individual field
     * @param {HTMLInputElement} input - Input element
     * @param {string} mode - 'login' or 'register'
     */
    validateField(input, mode) {
        const value = input.value.trim();
        const fieldId = input.id;
        
        this.clearFieldError(input);
        
        switch (fieldId) {
            case 'display-name':
                if (mode === 'register' && value.length > 0 && value.length < 2) {
                    this.showFormError(fieldId, 'Display name must be at least 2 characters');
                }
                break;
                
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    this.showFormError(fieldId, 'Please enter a valid email address');
                }
                break;
                
            case 'password':
                if (mode === 'register' && value.length > 0 && value.length < 6) {
                    this.showFormError(fieldId, 'Password must be at least 6 characters');
                }
                break;
                
            case 'confirm-password':
                const password = document.getElementById('password').value;
                if (value && value !== password) {
                    this.showFormError(fieldId, 'Passwords do not match');
                }
                break;
        }
    }
    
    /**
     * Check if email is valid
     * @param {string} email - Email address
     * @returns {boolean} - Is valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Show form error
     * @param {string} fieldId - Field ID
     * @param {string} message - Error message
     */
    showFormError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (field) {
            field.classList.add('error');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    /**
     * Clear field error
     * @param {HTMLInputElement} input - Input element
     */
    clearFieldError(input) {
        input.classList.remove('error');
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    /**
     * Clear all form errors
     */
    clearAllErrors() {
        const errorElements = this.authContainer.querySelectorAll('.form-error');
        const inputElements = this.authContainer.querySelectorAll('.form-input');
        
        errorElements.forEach(el => el.textContent = '');
        inputElements.forEach(el => el.classList.remove('error'));
    }
    
    /**
     * Set submit button loading state
     * @param {HTMLButtonElement} button - Submit button
     * @param {boolean} loading - Loading state
     */
    setSubmitButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
        } else {
            button.disabled = false;
            const isLogin = button.textContent.includes('Please wait');
            button.innerHTML = button.form.id === 'auth-form' ? 
                (isLogin ? 'Sign In' : 'Create Account') : 
                button.innerHTML.replace('<i class="fas fa-spinner fa-spin"></i> Please wait...', '');
        }
    }
    
    /**
     * Show toast notification
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} type - Toast type ('success', 'error', 'warning')
     */
    showToast(title, message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <i class="${icons[type]}"></i>
                </div>
                <div class="toast-message">
                    <div class="toast-title">${title}</div>
                    <div class="toast-text">${message}</div>
                </div>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
    
    /**
     * Get current user
     * @returns {Object|null} - Current user object
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Check if user is authenticated
     * @returns {boolean} - Is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser;
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Export for global access
window.AuthManager = AuthManager; 