// Supabase Configuration
const SUPABASE_URL = 'https://mpolescjssadjshuygwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wb2xlc2Nqc3NhZGpzaHV5Z3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODg2MTcsImV4cCI6MjA2MzY2NDYxN30.k1gRYfxHvOTYe8SUl08vLkqn4jpOeC0r5qfR68s2vtA';

// Wait for Supabase to load and create client
let supabase;
let isSupabaseReady = false;

const initializeSupabase = () => {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabase;
        isSupabaseReady = true;
        console.log('✅ Supabase client initialized successfully');
        return true;
    } else {
        console.log('⏳ Waiting for Supabase to load...');
        return false;
    }
};

// Try to initialize immediately
if (!initializeSupabase()) {
    // If failed, try again when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        if (!initializeSupabase()) {
            // If still failed, wait a bit more
            setTimeout(() => {
                if (!initializeSupabase()) {
                    console.error('❌ Failed to load Supabase client');
                }
            }, 1000);
        }
    });
}

// Check if user is logged in
const checkAuth = async () => {
    if (!isSupabaseReady || !supabase) {
        console.log('⚠️ Supabase not ready yet');
        return null;
    }
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Error checking auth:', error);
        return null;
    }
};

// Update navigation based on auth state
const updateNavigation = async () => {
    const user = await checkAuth();
    const navMenu = document.querySelector('.nav-menu');
    
    if (!navMenu) return;
    
    if (user) {
        // User is logged in
        const loginLink = navMenu.querySelector('a[href="login.html"]');
        const signupLink = navMenu.querySelector('a[href="signup.html"]');
        
        if (loginLink) {
            loginLink.textContent = 'Profile';
            loginLink.href = 'profile.html';
            loginLink.classList.remove('nav-cta');
            // Remove any existing click listeners by cloning the element
            const newLoginLink = loginLink.cloneNode(true);
            loginLink.parentNode.replaceChild(newLoginLink, loginLink);
        }
        
        if (signupLink) {
            signupLink.textContent = 'Logout';
            signupLink.href = '#';
            signupLink.classList.remove('nav-cta');
            signupLink.addEventListener('click', async (e) => {
                e.preventDefault();
                const { error } = await supabase.auth.signOut();
                if (!error) {
                    window.location.href = 'index.html';
                }
            });
        }
    }
};

// Listen for auth state changes
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (supabase) {
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event, session);
                updateNavigation();
            });
        }
    }, 100);
});

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', updateNavigation); 