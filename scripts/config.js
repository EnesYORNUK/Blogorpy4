// Environment Configuration
window.AppConfig = {
    // Detect environment
    environment: {
        isNetlify: window.location.hostname.includes('netlify.app'),
        isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        isProduction: window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'),
        isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    },
    
    // Supabase configuration
    supabase: {
        url: 'https://mpolescjssadjshuygwj.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wb2xlc2Nqc3NhZGpzaHV5Z3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODg2MTcsImV4cCI6MjA2MzY2NDYxN30.k1gRYfxHvOTYe8SUl08vLkqn4jpOeC0r5qfR68s2vtA'
    },
    
    // Debug settings
    debug: {
        enabled: function() {
            return this.environment.isDevelopment || 
                   window.location.search.includes('debug=true') ||
                   localStorage.getItem('debug-mode') === 'true';
        }.call(this),
        
        logLevel: function() {
            if (this.environment.isDevelopment) return 'verbose';
            if (this.environment.isNetlify) return 'info';
            return 'error';
        }.call(this)
    },
    
    // Performance settings
    performance: {
        supabaseRetryAttempts: this.environment.isNetlify ? 8 : 5,
        supabaseRetryDelay: this.environment.isNetlify ? 2000 : 1000,
        loadTimeout: this.environment.isNetlify ? 10000 : 5000
    },
    
    // URLs and paths
    urls: {
        base: window.location.origin,
        api: window.location.origin, // For future API endpoints
        assets: window.location.origin + '/'
    },
    
    // Feature flags
    features: {
        offlineSupport: false,
        analytics: this.environment.isProduction,
        errorReporting: this.environment.isProduction,
        performance: this.environment.isProduction
    },
    
    // Logging function
    log: function(level, message, data) {
        if (!this.debug.enabled && level === 'debug') return;
        
        const levels = { error: 0, warn: 1, info: 2, debug: 3, verbose: 4 };
        const currentLevel = levels[this.debug.logLevel] || 2;
        const messageLevel = levels[level] || 2;
        
        if (messageLevel <= currentLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            
            switch (level) {
                case 'error':
                    console.error(prefix, message, data || '');
                    break;
                case 'warn':
                    console.warn(prefix, message, data || '');
                    break;
                case 'debug':
                case 'verbose':
                    console.debug(prefix, message, data || '');
                    break;
                default:
                    console.log(prefix, message, data || '');
            }
        }
    }
};

// Initialize configuration
window.AppConfig.log('info', '🚀 AppConfig initialized', {
    environment: window.AppConfig.environment,
    debug: window.AppConfig.debug,
    features: window.AppConfig.features
});

// Add global utilities
window.log = window.AppConfig.log.bind(window.AppConfig);

// Environment-specific setup
if (window.AppConfig.environment.isNetlify) {
    window.AppConfig.log('info', '🌐 Running on Netlify');
    
    // Netlify-specific optimizations
    window.addEventListener('load', () => {
        window.AppConfig.log('info', '📊 Page load complete');
    });
    
} else if (window.AppConfig.environment.isLocalhost) {
    window.AppConfig.log('info', '💻 Running locally');
    
    // Development helpers
    window.config = window.AppConfig; // Easy access in console
} 