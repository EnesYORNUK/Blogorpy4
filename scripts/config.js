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
    }
};

// Safe initialization function
const initializeAppConfig = () => {
    try {
        // Ensure environment exists
        if (!window.AppConfig.environment) {
            console.warn('⚠️ Environment not ready, retrying...');
            setTimeout(initializeAppConfig, 100);
            return;
        }

        // Initialize debug settings
        window.AppConfig.debug = {
            enabled: window.AppConfig.environment.isDevelopment || 
                     window.location.search.includes('debug=true') ||
                     localStorage.getItem('debug-mode') === 'true',
            
            logLevel: window.AppConfig.environment.isDevelopment ? 'verbose' :
                      window.AppConfig.environment.isNetlify ? 'info' : 'error'
        };

        // Initialize performance settings
        window.AppConfig.performance = {
            supabaseRetryAttempts: window.AppConfig.environment.isNetlify ? 8 : 5,
            supabaseRetryDelay: window.AppConfig.environment.isNetlify ? 2000 : 1000,
            loadTimeout: window.AppConfig.environment.isNetlify ? 10000 : 5000
        };

        // URLs and paths
        window.AppConfig.urls = {
            base: window.location.origin,
            api: window.location.origin,
            assets: window.location.origin + '/'
        };

        // Feature flags
        window.AppConfig.features = {
            offlineSupport: false,
            analytics: window.AppConfig.environment.isProduction,
            errorReporting: window.AppConfig.environment.isProduction,
            performance: window.AppConfig.environment.isProduction
        };

        // Logging function
        window.AppConfig.log = function(level, message, data) {
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
        };

        // Mark as initialized
        window.AppConfig.initialized = true;

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
            window.config = window.AppConfig;
        }

    } catch (error) {
        console.error('❌ AppConfig initialization failed:', error);
        // Retry after a short delay
        setTimeout(initializeAppConfig, 200);
    }
};

// Start initialization
initializeAppConfig(); 