// Authentication JavaScript

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const passwordToggles = document.querySelectorAll('.password-toggle');
const passwordInput = document.getElementById('password');
const passwordStrengthBar = document.getElementById('passwordStrengthBar');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Auth.js loaded');
    console.log('📊 Supabase CDN:', !!window.supabase);
    console.log('🔧 Supabase Client:', !!window.supabaseClient);
    
    setupPasswordToggles();
    
    if (loginForm) {
        setupLoginForm();
    }
    
    if (signupForm) {
        setupSignupForm();
        setupPasswordStrength();
    }
});

// Setup password visibility toggles
const setupPasswordToggles = () => {
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const eyeIcon = toggle.querySelector('.eye-icon');
            const eyeOffIcon = toggle.querySelector('.eye-off-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'block';
            } else {
                input.type = 'password';
                eyeIcon.style.display = 'block';
                eyeOffIcon.style.display = 'none';
            }
        });
    });
};

// Setup login form
const setupLoginForm = () => {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate form
        if (!BlogorpyUtils.validateForm(loginForm)) {
            return;
        }
        
        // Get form data
        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');
        
        // Show loading state
        const submitBtn = loginForm.querySelector('.auth-button');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Sign in with Supabase
        try {
            console.log('🔑 Attempting login for:', email);
            
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized. Please refresh the page.');
            }
            
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            console.log('📊 Login response:', { data, error });
            
            if (error) {
                console.error('❌ Login error details:', error);
                throw error;
            }
            
            // Check if user exists and is confirmed
            if (data.user) {
                console.log('✅ User authenticated successfully');
                
                // Check email confirmation status
                if (!data.user.email_confirmed_at) {
                    console.log('⚠️ Email not confirmed');
                    showWarningMessage('Your email is not verified. Please check your inbox and click the verification link.', true);
                    return;
                }
                
                // Show success and redirect
                showSuccessMessage('Welcome back! Redirecting to homepage...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                throw new Error('Login failed - no user data returned');
            }
            
        } catch (error) {
            console.error('❌ Complete login error:', error);
            
            let errorMessage = 'Login failed. ';
            
            // More detailed error handling
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Please verify your email address first. Check your inbox for the verification link.';
            } else if (error.message.includes('Too many requests')) {
                errorMessage = 'Too many login attempts. Please wait a few minutes and try again.';
            } else if (error.message.includes('User not found')) {
                errorMessage = 'No account found with this email address. Please sign up first.';
            } else if (error.message.includes('signup is disabled')) {
                errorMessage = 'Authentication is temporarily disabled. Please try again later.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Connection failed. Please check your internet connection.';
            } else {
                errorMessage += (error.message || 'Unknown error occurred.');
            }
            
            BlogorpyUtils.showError(
                loginForm.querySelector('#email'),
                errorMessage
            );
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
};

// Setup signup form
const setupSignupForm = () => {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate form
        if (!BlogorpyUtils.validateForm(signupForm)) {
            return;
        }
        
        // Additional validation
        const password = signupForm.querySelector('#password').value;
        const confirmPassword = signupForm.querySelector('#confirmPassword').value;
        
        if (password !== confirmPassword) {
            BlogorpyUtils.showError(
                signupForm.querySelector('#confirmPassword'),
                'Passwords do not match'
            );
            return;
        }
        
        if (!isPasswordStrong(password)) {
            BlogorpyUtils.showError(
                signupForm.querySelector('#password'),
                'Password must be at least 8 characters with uppercase and number'
            );
            return;
        }
        
        // Get form data
        const formData = new FormData(signupForm);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        // Show loading state
        const submitBtn = signupForm.querySelector('.auth-button');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Sign up with Supabase
        try {
            console.log('🚀 Creating account for:', userData.email);
            
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized. Please refresh the page.');
            }
            
            const { data, error } = await window.supabaseClient.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        display_name: `${userData.firstName} ${userData.lastName}`
                    }
                }
            });
            
            console.log('📝 Supabase response:', { data, error });
            
            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }
            
            // Check registration result
            if (data.user) {
                if (data.user.email_confirmed_at) {
                    // User is already confirmed (rare case)
                    showSuccessMessage('Account created and verified! Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2500);
                } else {
                    // User needs email confirmation (normal case)
                    showSuccessMessage(`Account created successfully! Please check ${userData.email} for verification link.`);
                }
                
                // Clear form after successful signup
                signupForm.reset();
                updatePasswordStrength('');
                updatePasswordRequirements('');
                
                console.log('✅ Account creation completed');
            } else {
                throw new Error('Account creation failed - unknown error');
            }
            
        } catch (error) {
            console.error('❌ Account creation error:', error);
            
            let errorMessage = 'Account creation failed. ';
            
            if (error.message.includes('User already registered')) {
                errorMessage = 'This email is already registered. Try logging in instead.';
            } else if (error.message.includes('Password should be at least')) {
                errorMessage = 'Password must be at least 6 characters.';
            } else if (error.message.includes('Unable to validate email address')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.message.includes('signup is disabled')) {
                errorMessage = 'Account registration is currently disabled.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Please check your internet connection and try again.';
            } else {
                errorMessage += (error.message || 'Unknown error occurred.');
            }
            
            BlogorpyUtils.showError(
                signupForm.querySelector('#email'),
                errorMessage
            );
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
};

// Setup password strength indicator
const setupPasswordStrength = () => {
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        updatePasswordStrength(password);
        updatePasswordRequirements(password);
    });
};

// Update password strength indicator
const updatePasswordStrength = (password) => {
    if (!passwordStrengthBar) return;
    
    const strength = calculatePasswordStrength(password);
    
    // Remove all strength classes
    passwordStrengthBar.classList.remove('weak', 'medium', 'strong');
    
    if (password.length === 0) {
        passwordStrengthBar.style.width = '0';
        return;
    }
    
    // Add appropriate class
    if (strength < 3) {
        passwordStrengthBar.classList.add('weak');
    } else if (strength < 4) {
        passwordStrengthBar.classList.add('medium');
    } else {
        passwordStrengthBar.classList.add('strong');
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

// Check if password is strong enough
const isPasswordStrong = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[0-9]/.test(password);
};

// Update password requirements display
const updatePasswordRequirements = (password) => {
    const lengthReq = document.getElementById('lengthReq');
    const uppercaseReq = document.getElementById('uppercaseReq');
    const numberReq = document.getElementById('numberReq');
    
    // Length requirement
    if (lengthReq) {
        if (password.length >= 8) {
            lengthReq.classList.add('met');
        } else {
            lengthReq.classList.remove('met');
        }
    }
    
    // Uppercase requirement
    if (uppercaseReq) {
        if (/[A-Z]/.test(password)) {
            uppercaseReq.classList.add('met');
        } else {
            uppercaseReq.classList.remove('met');
        }
    }
    
    // Number requirement
    if (numberReq) {
        if (/[0-9]/.test(password)) {
            numberReq.classList.add('met');
        } else {
            numberReq.classList.remove('met');
        }
    }
};

// Clear all error messages
const clearAllErrors = () => {
    document.querySelectorAll('.error-message').forEach(error => {
        error.remove();
    });
    document.querySelectorAll('.form-input.error').forEach(input => {
        input.classList.remove('error');
    });
};

// Show success message
const showSuccessMessage = (message) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const authCard = document.querySelector('.auth-card');
    authCard.insertBefore(successDiv, authCard.firstChild);
};

// Show warning message
const showWarningMessage = (message, showResendButton = false) => {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'warning-message';
    
    if (showResendButton) {
        warningDiv.innerHTML = `
            ${message}
            <br><br>
            <button class="resend-verification-btn" onclick="resendVerificationEmail()">
                Resend Verification Email
            </button>
        `;
    } else {
        warningDiv.textContent = message;
    }
    
    const authCard = document.querySelector('.auth-card');
    authCard.insertBefore(warningDiv, authCard.firstChild);
};

// Resend verification email
const resendVerificationEmail = async () => {
    const emailInput = document.querySelector('#email');
    const email = emailInput.value;
    
    if (!email) {
        alert('Please enter your email address first.');
        return;
    }
    
    try {
        const { error } = await window.supabaseClient.auth.resend({
            type: 'signup',
            email: email
        });
        
        if (error) throw error;
        
        alert('Verification email sent! Please check your inbox.');
    } catch (error) {
        console.error('Failed to resend verification email:', error);
        alert('Failed to resend verification email: ' + error.message);
    }
};

// Handle social authentication
document.querySelectorAll('.social-button').forEach(button => {
    button.addEventListener('click', async () => {
        const provider = button.querySelector('span').textContent.toLowerCase();
        
        // Show loading state
        button.disabled = true;
        button.style.opacity = '0.7';
        
        try {
            const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin + '/index.html'
                }
            });
            
            if (error) throw error;
            
        } catch (error) {
            console.error(`${provider} auth error:`, error);
            
            let errorMessage = `Failed to authenticate with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`;
            if (error.message) {
                errorMessage += ': ' + error.message;
            }
            
            alert(errorMessage);
        } finally {
            button.disabled = false;
            button.style.opacity = '1';
        }
    });
});

// Debug function to test Supabase
window.testSupabase = () => {
    console.log('=== SUPABASE DEBUG ===');
    console.log('window.supabase:', window.supabase);
    console.log('window.supabaseClient:', window.supabaseClient);
    
    if (window.supabaseClient) {
        console.log('✅ Supabase client available');
        console.log('Auth object:', window.supabaseClient.auth);
    } else {
        console.log('❌ Supabase client NOT available');
    }
    console.log('===================');
};

// Auto-focus first input
window.addEventListener('load', () => {
    const firstInput = document.querySelector('.auth-form input');
    if (firstInput) {
        firstInput.focus();
    }
    
    // Test Supabase after page load
    setTimeout(() => {
        window.testSupabase();
    }, 500);
}); 