/**
 * Main JavaScript Module
 * 
 * Handles general UI interactions, GSAP animations,
 * navigation behavior, and overall site functionality.
 */

class MainController {
    constructor() {
        this.isInitialized = false;
        this.scrollThreshold = 100;
        
        this.init();
    }
    
    /**
     * Initialize the main controller
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEventListeners();
            this.initializeAnimations();
            this.handleNavigation();
            this.setupScrollEffects();
            
            this.isInitialized = true;
            console.log('Main controller initialized successfully');
            
        } catch (error) {
            console.error('Error initializing main controller:', error);
        }
    }
    
    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Window events
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
        window.addEventListener('load', this.handleWindowLoad.bind(this));
        
        // Navigation events
        this.setupNavigationListeners();
        
        // Create post button
        this.setupCreatePostButton();
        
        // Smooth scroll for anchor links
        this.setupSmoothScroll();
        
        // Intersection Observer for animations
        this.setupIntersectionObserver();
    }
    
    /**
     * Set up navigation event listeners
     */
    setupNavigationListeners() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('show');
                
                // Animate hamburger with GSAP
                if (typeof gsap !== 'undefined') {
                    if (hamburger.classList.contains('active')) {
                        gsap.to(navMenu, {
                            duration: 0.3,
                            opacity: 1,
                            y: 0,
                            ease: 'power2.out'
                        });
                    } else {
                        gsap.to(navMenu, {
                            duration: 0.3,
                            opacity: 0,
                            y: -20,
                            ease: 'power2.out'
                        });
                    }
                }
            });
            
            // Close menu when clicking nav links on mobile
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('show');
                    }
                });
            });
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && hamburger) {
                if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('show');
                }
            }
        });
    }
    
    /**
     * Setup create post button functionality
     */
    setupCreatePostButton() {
        const createPostBtn = document.getElementById('create-post-btn');
        
        if (createPostBtn) {
            createPostBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Check if user is authenticated
                if (window.authManager && window.authManager.currentUser) {
                    // User is logged in, redirect to create post page
                    window.location.href = 'create-post.html';
                } else {
                    // User not logged in, show login modal
                    if (window.authManager && typeof window.authManager.showLoginModal === 'function') {
                        window.authManager.showLoginModal();
                    } else {
                        // Fallback: redirect to login
                        alert('Please login to create a post');
                    }
                }
            });
        }
    }
    
    /**
     * Set up smooth scrolling for anchor links
     */
    setupSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - navbarHeight - 20;
                    
                    if (typeof gsap !== 'undefined') {
                        gsap.to(window, {
                            duration: 1,
                            scrollTo: targetPosition,
                            ease: 'power2.inOut'
                        });
                    } else {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
    
    /**
     * Initialize GSAP animations
     */
    initializeAnimations() {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not loaded, using fallback animations');
            return;
        }
        
        // Register ScrollTrigger if available
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        
        this.animateHero();
        this.animateFloatingCards();
        this.animateNavbar();
    }
    
    /**
     * Animate hero section
     */
    animateHero() {
        if (typeof gsap === 'undefined') return;
        
        const heroElements = {
            title: '.hero-title',
            subtitle: '.hero-subtitle',
            buttons: '.hero-buttons',
            image: '.hero-image'
        };
        
        // Set initial states
        gsap.set([heroElements.title, heroElements.subtitle, heroElements.buttons], {
            opacity: 0,
            y: 50
        });
        
        gsap.set(heroElements.image, {
            opacity: 0,
            x: 50
        });
        
        // Create timeline
        const tl = gsap.timeline({ delay: 0.5 });
        
        tl.to(heroElements.title, {
            duration: 0.8,
            opacity: 1,
            y: 0,
            ease: 'power2.out'
        })
        .to(heroElements.subtitle, {
            duration: 0.8,
            opacity: 1,
            y: 0,
            ease: 'power2.out'
        }, '-=0.4')
        .to(heroElements.buttons, {
            duration: 0.8,
            opacity: 1,
            y: 0,
            ease: 'power2.out'
        }, '-=0.4')
        .to(heroElements.image, {
            duration: 1,
            opacity: 1,
            x: 0,
            ease: 'power2.out'
        }, '-=0.6');
    }
    
    /**
     * Animate floating cards
     */
    animateFloatingCards() {
        if (typeof gsap === 'undefined') return;
        
        const cards = document.querySelectorAll('.card');
        
        cards.forEach((card, index) => {
            // Initial random rotation and position
            gsap.set(card, {
                rotation: Math.random() * 10 - 5,
                y: Math.random() * 20,
                scale: 0.8 + Math.random() * 0.2
            });
            
            // Floating animation
            gsap.to(card, {
                duration: 3 + Math.random() * 2,
                y: '+=20',
                rotation: '+=5',
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                delay: index * 0.5
            });
            
            // Hover effect
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.3,
                    scale: 1.1,
                    rotation: '+=10',
                    ease: 'power2.out'
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.3,
                    scale: 1,
                    rotation: '-=10',
                    ease: 'power2.out'
                });
            });
        });
    }
    
    /**
     * Animate navbar
     */
    animateNavbar() {
        if (typeof gsap === 'undefined') return;
        
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        // Initial state
        gsap.set(navbar, {
            y: -100,
            opacity: 0
        });
        
        // Animate in
        gsap.to(navbar, {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: 'power2.out',
            delay: 0.2
        });
    }
    
    /**
     * Set up intersection observer for scroll animations
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported');
            return;
        }
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements with fade-in class
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(el => observer.observe(el));
        
        // Observe section elements
        const sections = document.querySelectorAll('section');
        sections.forEach(section => observer.observe(section));
    }
    
    /**
     * Animate element when it comes into view
     * @param {HTMLElement} element - Element to animate
     */
    animateElement(element) {
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(element, {
                opacity: 0,
                y: 50
            }, {
                duration: 0.8,
                opacity: 1,
                y: 0,
                ease: 'power2.out'
            });
        } else {
            // Fallback CSS animation
            element.classList.add('visible');
        }
    }
    
    /**
     * Handle window scroll events
     */
    handleScroll() {
        const scrollY = window.scrollY;
        const navbar = document.getElementById('navbar');
        
        // Navbar scroll effects
        if (navbar) {
            if (scrollY > this.scrollThreshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        // Parallax effect for hero section
        if (typeof gsap !== 'undefined') {
            const heroImage = document.querySelector('.hero-image');
            if (heroImage && scrollY < window.innerHeight) {
                gsap.set(heroImage, {
                    y: scrollY * 0.3
                });
            }
        }
        
        // Update scroll progress
        this.updateScrollProgress();
    }
    
    /**
     * Update scroll progress indicator
     */
    updateScrollProgress() {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        // You can add a scroll progress bar here
        document.documentElement.style.setProperty('--scroll-progress', `${scrolled}%`);
    }
    
    /**
     * Handle window resize events
     */
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            const hamburger = document.getElementById('hamburger');
            const navMenu = document.getElementById('nav-menu');
            
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('show');
            }
        }
        
        // Refresh GSAP animations if needed
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }
    
    /**
     * Handle window load event
     */
    handleWindowLoad() {
        // Hide any loading indicators
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Start main animations
        if (typeof gsap !== 'undefined') {
            gsap.set('body', { opacity: 1 });
        }
    }
    
    /**
     * Handle navigation between pages
     */
    handleNavigation() {
        // Add page transition effects
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip external links and anchors
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
                return;
            }
            
            link.addEventListener('click', (e) => {
                if (typeof gsap !== 'undefined') {
                    e.preventDefault();
                    
                    // Page transition animation
                    gsap.to('body', {
                        duration: 0.3,
                        opacity: 0,
                        ease: 'power2.out',
                        onComplete: () => {
                            window.location.href = href;
                        }
                    });
                }
            });
        });
    }
    
    /**
     * Throttle function for performance
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} - Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Debounce function for performance
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(notification, {
                opacity: 0,
                y: -50
            }, {
                duration: 0.5,
                opacity: 1,
                y: 0,
                ease: 'power2.out'
            });
            
            // Auto remove
            setTimeout(() => {
                gsap.to(notification, {
                    duration: 0.5,
                    opacity: 0,
                    y: -50,
                    ease: 'power2.out',
                    onComplete: () => {
                        if (document.body.contains(notification)) {
                            document.body.removeChild(notification);
                        }
                    }
                });
            }, 3000);
        } else {
            notification.style.opacity = '1';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 3000);
        }
    }
    
    /**
     * Add ripple effect to buttons
     * @param {HTMLElement} button - Button element
     * @param {Event} event - Click event
     */
    addRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (button.contains(ripple)) {
                button.removeChild(ripple);
            }
        }, 600);
    }
    
    /**
     * Initialize ripple effects for buttons
     */
    initializeRippleEffects() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.addRippleEffect(button, e);
            });
        });
    }
    
    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                        }
                        
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
    
    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal.show');
                openModals.forEach(modal => {
                    modal.classList.remove('show');
                });
            }
            
            // Tab navigation improvements
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        // Remove keyboard navigation class on mouse use
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
}

// Initialize main controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mainController = new MainController();
});

// Global showToast function
window.showToast = function(message, type = 'info') {
    // Use authManager's showToast if available
    if (window.authManager && typeof window.authManager.showToast === 'function') {
        window.authManager.showToast('', message, type);
        return;
    }
    
    // Fallback toast implementation
    const toastContainer = document.getElementById('toast-container') || 
                           document.querySelector('.toast-container');
    
    if (!toastContainer) {
        // Create toast container if it doesn't exist
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toast-container';
        document.body.appendChild(container);
        toastContainer = container;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                  type === 'error' ? 'exclamation-circle' : 
                                  type === 'warning' ? 'exclamation-triangle' : 
                                  'info-circle'}"></i>
            </div>
            <div class="toast-message">
                <div class="toast-text">${message}</div>
            </div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 4000);
};

// Export for global access
window.MainController = MainController; 