// Netlify Function for Authentication
exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': 'https://blogorpy.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers, 
            body: JSON.stringify({ error: 'Method not allowed' }) 
        };
    }

    try {
        const { createClient } = require('@supabase/supabase-js');
        
        const supabase = createClient(
            process.env.SUPABASE_URL || 'https://mpolescjssadjshuygwj.supabase.co',
            process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wb2xlc2Nqc3NhZGpzaHV5Z3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODg2MTcsImV4cCI6MjA2MzY2NDYxN30.k1gRYfxHvOTYe8SUl08vLkqn4jpOeC0r5qfR68s2vtA'
        );

        const { action, email, password, userData } = JSON.parse(event.body);

        switch (action) {
            case 'signup':
                const signupResult = await supabase.auth.signUp({
                    email,
                    password,
                    options: userData ? { data: userData } : undefined
                });
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(signupResult)
                };

            case 'login':
                const loginResult = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(loginResult)
                };

            case 'logout':
                const logoutResult = await supabase.auth.signOut();
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(logoutResult)
                };

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid action' })
                };
        }

    } catch (error) {
        console.error('Auth function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
}; 