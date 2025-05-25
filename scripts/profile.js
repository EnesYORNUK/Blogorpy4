// Profile Page JavaScript

let currentUser = null;

// Initialize profile page
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    await checkAuthenticationStatus();
    
    // Load user profile data
    await loadUserProfile();
    
    // Setup event listeners
    setupEventListeners();
});

// Check authentication status
const checkAuthenticationStatus = async () => {
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }
        
        currentUser = user;
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = 'login.html';
    }
};

// Load user profile data
const loadUserProfile = async () => {
    if (!currentUser) return;
    
    try {
        // Update profile header
        updateProfileHeader();
        
        // Load user metadata and populate forms
        populatePersonalInfoForm();
        
    } catch (error) {
        console.error('Failed to load profile data:', error);
        showMessage('Failed to load profile data', 'error');
    }
};

// Update profile header
const updateProfileHeader = () => {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const joinedDate = document.getElementById('joinedDate');
    const avatarInitials = document.getElementById('avatarInitials');
    
    // Extract name from user metadata or email
    const firstName = currentUser.user_metadata?.first_name || '';
    const lastName = currentUser.user_metadata?.last_name || '';
    const displayName = firstName && lastName ? `${firstName} ${lastName}` : currentUser.email.split('@')[0];
    
    // Update elements
    profileName.textContent = displayName;
    profileEmail.textContent = currentUser.email;
    
    // Format joined date
    const joinDate = new Date(currentUser.created_at);
    joinedDate.textContent = joinDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
    });
    
    // Update avatar initials
    const initials = getInitials(firstName, lastName, currentUser.email);
    avatarInitials.textContent = initials;
};

// Get user initials for avatar
const getInitials = (firstName, lastName, email) => {
    if (firstName && lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }
    
    if (firstName) {
        return firstName.charAt(0).toUpperCase();
    }
    
    // Use email as fallback
    return email.charAt(0).toUpperCase();
};

// Populate personal info form
const populatePersonalInfoForm = () => {
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const bioInput = document.getElementById('bio');
    const websiteInput = document.getElementById('website');
    const locationInput = document.getElementById('location');
    
    // Set values from user metadata
    firstNameInput.value = currentUser.user_metadata?.first_name || '';
    lastNameInput.value = currentUser.user_metadata?.last_name || '';
    emailInput.value = currentUser.email;
    bioInput.value = currentUser.user_metadata?.bio || '';
    websiteInput.value = currentUser.user_metadata?.website || '';
    locationInput.value = currentUser.user_metadata?.location || '';
};

// Setup event listeners
const setupEventListeners = () => {
    // Tab switching
    setupTabs();
    
    // Form submissions
    setupForms();
    
    // Avatar upload
    setupAvatarUpload();
    
    // Password toggles
    setupPasswordToggles();
    
    // Logout buttons
    setupLogoutButtons();
    
    // Password strength indicator
    setupPasswordStrength();
};

// Setup tab switching
const setupTabs = () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and content
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // Load liked posts when liked tab is activated
            if (targetTab === 'liked') {
                await loadLikedPosts();
            }
        });
    });
};

// Setup form submissions
const setupForms = () => {
    // Personal info form
    const personalInfoForm = document.getElementById('personalInfoForm');
    personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    
    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    changePasswordForm.addEventListener('submit', handlePasswordChangeSubmit);
    
    // Save preferences button
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    savePreferencesBtn.addEventListener('click', handlePreferencesSave);
    
    // Delete account button
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    deleteAccountBtn.addEventListener('click', handleAccountDeletion);
};

// Handle personal info form submission
const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.form-submit-btn');
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Get form data
        const formData = new FormData(form);
        const userData = {
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            bio: formData.get('bio'),
            website: formData.get('website'),
            location: formData.get('location')
        };
        
        // Update user metadata
        const { error } = await window.supabaseClient.auth.updateUser({
            data: userData
        });
        
        if (error) throw error;
        
        // Update current user object
        currentUser.user_metadata = { ...currentUser.user_metadata, ...userData };
        
        // Update profile header
        updateProfileHeader();
        
        // Show success message
        showMessage('Profile updated successfully!', 'success');
        
    } catch (error) {
        console.error('Profile update failed:', error);
        showMessage('Failed to update profile: ' + error.message, 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
};

// Handle password change submission
const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.form-submit-btn');
    
    // Get form data
    const currentPassword = form.querySelector('#currentPassword').value;
    const newPassword = form.querySelector('#newPassword').value;
    const confirmNewPassword = form.querySelector('#confirmNewPassword').value;
    
    // Validate passwords
    if (newPassword !== confirmNewPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showMessage('New password must be at least 8 characters long', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Update password
        const { error } = await window.supabaseClient.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        
        // Clear form
        form.reset();
        
        // Show success message
        showMessage('Password updated successfully!', 'success');
        
    } catch (error) {
        console.error('Password update failed:', error);
        showMessage('Failed to update password: ' + error.message, 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
};

// Handle preferences save
const handlePreferencesSave = async (e) => {
    const btn = e.target;
    
    // Show loading state
    btn.classList.add('loading');
    btn.disabled = true;
    
    try {
        // Get preference values
        const preferences = {
            email_blog_posts: document.getElementById('emailBlogPosts').checked,
            email_comments: document.getElementById('emailComments').checked,
            email_newsletter: document.getElementById('emailNewsletter').checked,
            profile_visibility: document.getElementById('profileVisibility').checked,
            show_email: document.getElementById('showEmail').checked
        };
        
        // Update user metadata with preferences
        const { error } = await window.supabaseClient.auth.updateUser({
            data: { preferences }
        });
        
        if (error) throw error;
        
        // Show success message
        showMessage('Preferences saved successfully!', 'success');
        
    } catch (error) {
        console.error('Preferences save failed:', error);
        showMessage('Failed to save preferences: ' + error.message, 'error');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
};

// Handle account deletion
const handleAccountDeletion = async () => {
    const confirmed = confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    const doubleConfirmed = confirm(
        'This will permanently delete all your data. Type "DELETE" to confirm.'
    );
    
    if (!doubleConfirmed) return;
    
    try {
        // In a real app, you would call a backend endpoint to delete the account
        // For now, we'll just sign out the user
        await window.supabaseClient.auth.signOut();
        
        alert('Account deletion requested. You have been logged out.');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Account deletion failed:', error);
        showMessage('Failed to delete account: ' + error.message, 'error');
    }
};

// Setup avatar upload
const setupAvatarUpload = () => {
    const avatarUploadBtn = document.getElementById('avatarUploadBtn');
    const avatarInput = document.getElementById('avatarInput');
    const avatarImage = document.getElementById('avatarImage');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    
    avatarUploadBtn.addEventListener('click', () => {
        avatarInput.click();
    });
    
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showMessage('Please select an image file', 'error');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Image size must be less than 5MB', 'error');
            return;
        }
        
        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarImage.src = e.target.result;
            avatarImage.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
        
        // In a real app, you would upload the file to storage here
        showMessage('Avatar updated! (Note: This is a demo - file not actually uploaded)', 'success');
    });
};

// Setup password toggles
const setupPasswordToggles = () => {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const eyeIcon = toggle.querySelector('.eye-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                eyeIcon.style.opacity = '0.6';
            } else {
                input.type = 'password';
                eyeIcon.style.opacity = '1';
            }
        });
    });
};

// Setup logout buttons
const setupLogoutButtons = () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const footerLogout = document.getElementById('footerLogout');
    
    [logoutBtn, footerLogout].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                try {
                    await window.supabaseClient.auth.signOut();
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Logout failed:', error);
                    showMessage('Failed to logout: ' + error.message, 'error');
                }
            });
        }
    });
};

// Setup password strength indicator
const setupPasswordStrength = () => {
    const newPasswordInput = document.getElementById('newPassword');
    const strengthBar = document.getElementById('newPasswordStrengthBar');
    
    if (newPasswordInput && strengthBar) {
        newPasswordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = calculatePasswordStrength(password);
            
            // Remove all strength classes
            strengthBar.classList.remove('weak', 'medium', 'strong');
            
            if (password.length === 0) {
                strengthBar.style.width = '0';
                return;
            }
            
            // Add appropriate class
            if (strength < 3) {
                strengthBar.classList.add('weak');
            } else if (strength < 4) {
                strengthBar.classList.add('medium');
            } else {
                strengthBar.classList.add('strong');
            }
        });
    }
};

// Calculate password strength
const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return strength;
};

// Show message (success/error)
const showMessage = (message, type = 'info') => {
    // Remove existing messages
    document.querySelectorAll('.success-message, .error-message').forEach(msg => {
        msg.remove();
    });
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    // Insert at top of main content
    const profileMain = document.querySelector('.profile-main .container');
    profileMain.insertBefore(messageDiv, profileMain.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
    
    // Scroll to top to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Load liked posts
const loadLikedPosts = async () => {
    try {
        console.log('🔄 Loading liked posts...');
        
        // Show loading state
        document.getElementById('likedPostsLoading').style.display = 'flex';
        document.getElementById('likedPostsEmpty').style.display = 'none';
        document.getElementById('likedPostsGrid').innerHTML = '';
        
        if (!currentUser) {
            console.error('❌ No current user');
            return;
        }
        
        // Get user's liked posts
        const { data: likedPosts, error } = await window.supabaseClient
            .from('user_favorites')
            .select(`
                post_id,
                created_at,
                posts (
                    id,
                    title,
                    content,
                    category,
                    author_name,
                    created_at,
                    excerpt
                )
            `)
            .eq('user_id', currentUser.id)
            .eq('type', 'like')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error loading liked posts:', error);
            showMessage('Error loading liked posts: ' + error.message, 'error');
            return;
        }
        
        console.log('📋 Liked posts loaded:', likedPosts);
        
        // Hide loading state
        document.getElementById('likedPostsLoading').style.display = 'none';
        
        if (!likedPosts || likedPosts.length === 0) {
            // Show empty state
            document.getElementById('likedPostsEmpty').style.display = 'flex';
        } else {
            // Populate liked posts grid
            populateLikedPosts(likedPosts);
        }
        
    } catch (error) {
        console.error('❌ Error loading liked posts:', error);
        document.getElementById('likedPostsLoading').style.display = 'none';
        showMessage('An unexpected error occurred while loading liked posts', 'error');
    }
};

// Populate liked posts grid
const populateLikedPosts = (likedPosts) => {
    const grid = document.getElementById('likedPostsGrid');
    
    grid.innerHTML = likedPosts.map(likedPost => {
        const post = likedPost.posts;
        if (!post) return ''; // Skip if post is null (deleted post)
        
        // Create excerpt from content or use existing excerpt
        const excerpt = post.excerpt || 
                       (post.content.length > 150 ? 
                        post.content.substring(0, 150) + '...' : 
                        post.content);
        
        // Format dates
        const likedDate = formatDate(likedPost.created_at);
        const postDate = formatDate(post.created_at);
        
        // Format category
        const formattedCategory = formatCategory(post.category);
        
        return `
            <a href="blog-detail.html?id=${post.id}" class="liked-post-card">
                <h4 class="liked-post-title">${post.title}</h4>
                <p class="liked-post-excerpt">${excerpt}</p>
                <div class="liked-post-meta">
                    <span class="liked-post-category">${formattedCategory}</span>
                    <span class="liked-post-date">${postDate}</span>
                </div>
                <div class="liked-post-meta" style="margin-top: 0.5rem; font-size: 0.7rem; opacity: 0.7;">
                    <span>Liked: ${likedDate}</span>
                    <span>${post.author_name}</span>
                </div>
            </a>
        `;
    }).filter(html => html).join(''); // Filter out empty strings
};

// Utility functions for liked posts
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatCategory = (category) => {
    const categoryMap = {
        'technology': 'Technology',
        'lifestyle': 'Lifestyle',
        'travel': 'Travel',
        'food': 'Food',
        'health': 'Health',
        'education': 'Education',
        'business': 'Business',
        'entertainment': 'Entertainment',
        'sports': 'Sports',
        'other': 'Other'
    };
    
    return categoryMap[category] || category;
}; 