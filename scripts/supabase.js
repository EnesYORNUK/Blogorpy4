// Supabase Configuration
const SUPABASE_URL = 'https://mpolescjssadjshuygwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wb2xlc2Nqc3NhZGpzaHV5Z3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODg2MTcsImV4cCI6MjA2MzY2NDYxN30.k1gRYfxHvOTYe8SUl08vLkqn4jpOeC0r5qfR68s2vtA';

// Debug information for Netlify
console.log('🌍 Environment:', {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    isNetlify: window.location.hostname.includes('netlify.app'),
    userAgent: navigator.userAgent
});

// Wait for Supabase to load and create client
let supabase;
let isSupabaseReady = false;
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 5;

const initializeSupabase = () => {
    initializationAttempts++;
    console.log(`🔄 Supabase initialization attempt ${initializationAttempts}/${MAX_INIT_ATTEMPTS}`);
    
    if (typeof window === 'undefined') {
        console.error('❌ Window object not available');
        return false;
    }
    
    if (!window.supabase) {
        console.log('⏳ Supabase library not loaded yet, waiting...');
        return false;
    }
    
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabase;
        isSupabaseReady = true;
        console.log('✅ Supabase client initialized successfully');
        console.log('📡 Supabase URL:', SUPABASE_URL);
        return true;
    } catch (error) {
        console.error('❌ Error creating Supabase client:', error);
        return false;
    }
};

// Progressive initialization with multiple fallbacks
const attemptInitialization = () => {
    if (initializationAttempts >= MAX_INIT_ATTEMPTS) {
        console.error('❌ Maximum initialization attempts reached. Supabase initialization failed.');
        return;
    }
    
    if (initializeSupabase()) {
        console.log('🎉 Supabase initialized successfully');
        // Initialize auth state after successful initialization
        setTimeout(() => {
            updateNavigation();
            setupAuthStateListener();
        }, 100);
    } else {
        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, initializationAttempts - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        setTimeout(attemptInitialization, delay);
    }
};

// Start initialization process
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attemptInitialization);
} else {
    attemptInitialization();
}

// Check if user is logged in
const checkAuth = async () => {
    if (!isSupabaseReady || !supabase) {
        console.log('⚠️ Supabase not ready yet for auth check');
        return null;
    }
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        // Handle specific auth errors gracefully
        if (error) {
            // AuthSessionMissingError is normal when user is not logged in
            if (error.name === 'AuthSessionMissingError' || error.message.includes('Auth session missing')) {
                console.log('👤 No active session (user not logged in)');
                return null;
            }
            // Log other auth errors
            console.warn('⚠️ Auth check warning:', error.message);
            return null;
        }
        
        console.log('👤 Auth check result:', user ? 'User logged in' : 'No user');
        return user;
    } catch (error) {
        // Handle network or other errors
        if (error.message.includes('Auth session missing')) {
            console.log('👤 No active session (user not logged in)');
            return null;
        }
        console.error('❌ Auth check failed:', error.message);
        return null;
    }
};

// Update navigation based on auth state
const updateNavigation = async () => {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) {
        console.log('⚠️ Navigation menu not found');
        return;
    }
    
    const user = await checkAuth();
    console.log('🔄 Updating navigation for user:', user ? 'authenticated' : 'guest');
    
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
                console.log('🚪 Logging out user...');
                const { error } = await supabase.auth.signOut();
                if (!error) {
                    console.log('✅ User logged out successfully');
                    window.location.href = 'index.html';
                } else {
                    console.error('❌ Logout error:', error);
                }
            });
        }
        
        // Add "Create Blog" link if not exists
        const blogsLink = navMenu.querySelector('a[href="blogs.html"]');
        if (blogsLink && !navMenu.querySelector('a[href="create-blog.html"]')) {
            const createBlogLink = document.createElement('a');
            createBlogLink.href = 'create-blog.html';
            createBlogLink.className = 'nav-link';
            createBlogLink.textContent = 'Create Blog';
            createBlogLink.style.color = '#6B4423';
            createBlogLink.style.fontWeight = '600';
            
            // Insert after blogs link
            blogsLink.parentNode.insertBefore(createBlogLink, blogsLink.nextSibling);
        }
    } else {
        // User is not logged in, remove create blog link if exists
        const createBlogLink = navMenu.querySelector('a[href="create-blog.html"]');
        if (createBlogLink) {
            createBlogLink.remove();
        }
    }
};

// Setup auth state listener
const setupAuthStateListener = () => {
    if (!supabase) {
        console.log('⚠️ Cannot setup auth listener - Supabase not ready');
        return;
    }
    
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth state changed:', event, session ? 'User session active' : 'No session');
        updateNavigation();
    });
};

// Export for global access
window.checkAuth = checkAuth;
window.updateNavigation = updateNavigation; 