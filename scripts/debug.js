// Netlify Debugging System
window.NetlifyDebug = {
    init() {
        console.group('🔍 Netlify Debug Information');
        
        // Environment info
        console.log('🌍 Environment:', {
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            port: window.location.port,
            pathname: window.location.pathname,
            search: window.location.search,
            isNetlify: window.location.hostname.includes('netlify.app'),
            isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        
        // Check loaded resources
        this.checkResources();
        
        // Check Supabase
        this.checkSupabase();
        
        // Listen for errors
        this.setupErrorHandling();
        
        console.groupEnd();
    },
    
    checkResources() {
        console.group('📦 Resource Check');
        
        // Check scripts
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        scripts.forEach(script => {
            const status = script.complete ? '✅' : '⏳';
            console.log(`${status} Script:`, script.src);
        });
        
        // Check stylesheets
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        stylesheets.forEach(link => {
            const status = link.sheet ? '✅' : '❌';
            console.log(`${status} Stylesheet:`, link.href);
        });
        
        console.groupEnd();
    },
    
    checkSupabase() {
        console.group('🔧 Supabase Check');
        
        console.log('Window.supabase available:', !!window.supabase);
        console.log('Supabase client initialized:', !!window.supabaseClient);
        console.log('Supabase URL accessible:', navigator.onLine ? 'Online' : 'Offline');
        
        if (window.supabase) {
            console.log('✅ Supabase library loaded');
        } else {
            console.error('❌ Supabase library not loaded');
            console.log('💡 Possible causes:');
            console.log('   1. CDN blocked or slow');
            console.log('   2. Network connectivity issues');
            console.log('   3. Script loading order problems');
        }
        
        console.groupEnd();
    },
    
    setupErrorHandling() {
        console.group('🚨 Error Handling Setup');
        
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('💥 Global Error:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
            
            // Send to external logging service if needed
            this.logToService('error', {
                type: 'javascript-error',
                message: event.message,
                stack: event.error?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('💥 Unhandled Promise Rejection:', event.reason);
            
            this.logToService('error', {
                type: 'promise-rejection',
                reason: event.reason?.toString(),
                stack: event.reason?.stack,
                url: window.location.href
            });
        });
        
        // Network errors
        window.addEventListener('offline', () => {
            console.warn('📡 Network: Offline');
        });
        
        window.addEventListener('online', () => {
            console.log('📡 Network: Online');
        });
        
        console.log('✅ Error handlers set up');
        console.groupEnd();
    },
    
    logToService(level, data) {
        // You can extend this to send logs to external services
        // For now, we'll just store in localStorage for debugging
        try {
            const logs = JSON.parse(localStorage.getItem('netlify-debug-logs') || '[]');
            logs.push({
                level,
                data,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 50 logs
            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }
            
            localStorage.setItem('netlify-debug-logs', JSON.stringify(logs));
        } catch (e) {
            console.warn('Could not save debug log:', e);
        }
    },
    
    showLogs() {
        try {
            const logs = JSON.parse(localStorage.getItem('netlify-debug-logs') || '[]');
            console.table(logs);
            return logs;
        } catch (e) {
            console.warn('Could not retrieve logs:', e);
            return [];
        }
    },
    
    clearLogs() {
        localStorage.removeItem('netlify-debug-logs');
        console.log('🧹 Debug logs cleared');
    },
    
    testSupabaseConnection() {
        console.group('🧪 Testing Supabase Connection');
        
        if (!window.supabaseClient) {
            console.error('❌ Supabase client not available');
            console.groupEnd();
            return;
        }
        
        // Test basic connection
        window.supabaseClient.auth.getSession()
            .then(({ data, error }) => {
                if (error) {
                    console.error('❌ Supabase connection error:', error);
                } else {
                    console.log('✅ Supabase connection successful');
                    console.log('Session data:', data);
                }
            })
            .catch(err => {
                console.error('❌ Supabase connection failed:', err);
            })
            .finally(() => {
                console.groupEnd();
            });
    }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.NetlifyDebug.init();
    });
} else {
    window.NetlifyDebug.init();
}

// Add helpful commands to console
console.log('🛠️ Debug commands available:');
console.log('  NetlifyDebug.showLogs() - Show debug logs');
console.log('  NetlifyDebug.clearLogs() - Clear debug logs');
console.log('  NetlifyDebug.testSupabaseConnection() - Test Supabase');
console.log('  NetlifyDebug.checkResources() - Check loaded resources'); 