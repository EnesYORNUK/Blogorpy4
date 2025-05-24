// Authentication JavaScript

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const passwordToggles = document.querySelectorAll('.password-toggle');
const passwordInput = document.getElementById('password');
const passwordStrengthBar = document.getElementById('passwordStrengthBar');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
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
        
        // Simulate API call
        try {
            await simulateApiCall(1500);
            
            // In a real app, this would authenticate with a backend
            console.log('Login attempt:', { email, password, remember });
            
            // Show success and redirect
            showSuccessMessage('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            BlogorpyUtils.showError(
                loginForm.querySelector('#email'),
                'Invalid email or password'
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
                'Please choose a stronger password'
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
        
        // Simulate API call
        try {
            await simulateApiCall(2000);
            
            // In a real app, this would create an account
            console.log('Signup attempt:', userData);
            
            // Show success and redirect
            showSuccessMessage('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            
        } catch (error) {
            BlogorpyUtils.showError(
                signupForm.querySelector('#email'),
                'This email is already registered'
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

// Simulate API call
const simulateApiCall = (delay) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate random success/failure
            if (Math.random() > 0.3) {
                resolve();
            } else {
                reject(new Error('API Error'));
            }
        }, delay);
    });
};

// Handle social authentication
document.querySelectorAll('.social-button').forEach(button => {
    button.addEventListener('click', () => {
        const provider = button.querySelector('span').textContent;
        console.log(`Social auth with ${provider}`);
        
        // In a real app, this would initiate OAuth flow
        // For demo, just show a message
        alert(`${provider} authentication would be initiated here`);
    });
});

// Auto-focus first input
window.addEventListener('load', () => {
    const firstInput = document.querySelector('.auth-form input');
    if (firstInput) {
        firstInput.focus();
    }
}); 