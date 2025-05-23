// Simple debug version of PostEditor
console.log('Loading create-post-debug.js...');

class PostEditorDebug {
    constructor() {
        console.log('PostEditorDebug constructor called');
        this.currentUser = null;
        this.quill = null;
        this.isDraft = false;
        
        this.init();
    }

    async init() {
        console.log('PostEditorDebug init() called');
        
        try {
            // Check if supabaseClient exists
            if (typeof supabaseClient === 'undefined') {
                console.error('supabaseClient is not defined!');
                return;
            }
            console.log('supabaseClient found:', supabaseClient);

            // Get current user
            const user = await this.getCurrentUser();
            console.log('Current user:', user);
            
            if (!user) {
                console.log('No user found, redirecting to index.html');
                window.location.href = 'index.html';
                return;
            }

            this.currentUser = user;
            this.setupBasicEditor();
            this.setupBasicEventListeners();
            
            console.log('PostEditorDebug initialization complete');
        } catch (error) {
            console.error('Error in init():', error);
        }
    }

    async getCurrentUser() {
        try {
            console.log('Getting current user...');
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            if (error) {
                console.error('Auth error:', error);
                throw error;
            }
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    setupBasicEditor() {
        console.log('Setting up basic Quill editor...');
        
        const editorElement = document.getElementById('post-content');
        if (!editorElement) {
            console.error('post-content element not found!');
            return;
        }

        this.quill = new Quill('#post-content', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic'],
                    ['link'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }]
                ]
            },
            placeholder: 'Start writing your post...'
        });
        console.log('Quill editor initialized');
    }

    setupBasicEventListeners() {
        console.log('Setting up basic event listeners...');

        // Save draft button
        const saveDraftBtn = document.getElementById('save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Save draft button clicked');
                this.isDraft = true;
                this.savePost();
            });
        } else {
            console.error('save-draft-btn not found!');
        }

        // Publish button
        const publishBtn = document.getElementById('publish-btn');
        if (publishBtn) {
            publishBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Publish button clicked');
                this.isDraft = false;
                this.savePost();
            });
        } else {
            console.error('publish-btn not found!');
        }
    }

    async savePost() {
        console.log('savePost() called, isDraft:', this.isDraft);
        
        try {
            // Get form data
            const title = document.getElementById('post-title')?.value?.trim();
            console.log('Title:', title);
            
            if (!title) {
                alert('Post title is required!');
                return;
            }

            const content = this.quill ? this.quill.root.innerHTML : '';
            const plainText = this.quill ? this.quill.getText().trim() : '';
            console.log('Content length:', content.length);
            console.log('Plain text length:', plainText.length);

            if (plainText.length < 10) {
                alert('Post content is too short!');
                return;
            }

            // Prepare minimal post data
            const postData = {
                title: title,
                content: content,
                excerpt: plainText.substring(0, 150) + '...',
                published: !this.isDraft,
                author_id: this.currentUser.id
            };

            console.log('Post data to save:', postData);

            // Save to database
            console.log('Attempting to save to Supabase...');
            const { data, error } = await supabaseClient
                .from('posts')
                .insert([postData])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                alert('Error saving post: ' + error.message);
                return;
            }

            console.log('Post saved successfully:', data);
            const action = this.isDraft ? 'saved as draft' : 'published';
            alert(`Post ${action} successfully!`);

            // Redirect to post page (for now just reload)
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Error in savePost():', error);
            alert('Failed to save post: ' + error.message);
        }
    }
}

// Initialize when DOM is loaded
console.log('Setting up DOMContentLoaded listener...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing PostEditorDebug...');
    
    // Wait a bit for all scripts to load
    setTimeout(() => {
        if (typeof Quill === 'undefined') {
            console.error('Quill is not loaded!');
            return;
        }
        
        window.postEditorDebug = new PostEditorDebug();
    }, 500);
});

console.log('create-post-debug.js loaded completely'); 