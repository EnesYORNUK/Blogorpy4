/**
 * Pages JavaScript - About & Contact Pages
 * 
 * This file contains JavaScript functionality specific to the
 * About and Contact pages of the Blogorpy platform.
 */

class PagesManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.initializePage();
    }

    /**
     * Determine current page based on URL
     */
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('about.html')) return 'about';
        if (path.includes('contact.html')) return 'contact';
        return 'other';
    }

    /**
     * Initialize page-specific functionality
     */
    initializePage() {
        switch (this.currentPage) {
            case 'about':
                this.initializeAboutPage();
                break;
            case 'contact':
                this.initializeContactPage();
                break;
        }

        // Common initialization for all pages
        this.initializeCommonFeatures();
    }

    /**
     * Initialize About page specific features
     */
    initializeAboutPage() {
        // Add GSAP animations for about sections
        this.animateAboutSections();
        
        // Handle CTA register button
        const ctaRegisterBtn = document.getElementById('cta-register');
        if (ctaRegisterBtn) {
            ctaRegisterBtn.addEventListener('click', () => {
                this.openAuthModal('register');
            });
        }

        // Add hover effects to feature cards
        this.setupFeatureCardEffects();
    }

    /**
     * Initialize Contact page specific features
     */
    initializeContactPage() {
        // Contact form handling is already in contact.html
        // Add any additional contact page functionality here
        
        // Animate contact method cards
        this.animateContactMethods();
        
        // Add copy email functionality
        this.setupEmailCopyFeature();
        
        // Setup FAQ interactions
        this.setupFAQInteractions();
    }

    /**
     * Initialize common features for all pages
     */
    initializeCommonFeatures() {
        // Smooth scrolling for anchor links
        this.setupSmoothScrolling();
        
        // Initialize tooltips if needed
        this.setupTooltips();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
    }

    /**
     * Animate about page sections with GSAP
     */
    animateAboutSections() {
        if (typeof gsap !== 'undefined') {
            // Animate about grid items
            gsap.from('.about-section', {
                duration: 0.8,
                y: 50,
                opacity: 0,
                stagger: 0.2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.about-grid',
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            });

            // Animate feature cards
            gsap.from('.feature-card', {
                duration: 0.6,
                scale: 0.9,
                opacity: 0,
                stagger: 0.15,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: '.features-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });

            // Animate CTA section
            gsap.from('.cta-content', {
                duration: 1,
                y: 30,
                opacity: 0,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.cta-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    }

    /**
     * Animate contact page methods
     */
    animateContactMethods() {
        if (typeof gsap !== 'undefined') {
            gsap.from('.contact-method', {
                duration: 0.8,
                y: 40,
                opacity: 0,
                stagger: 0.2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.contact-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });

            // Animate FAQ items
            gsap.from('.faq-item', {
                duration: 0.6,
                x: -30,
                opacity: 0,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.faq-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    }

    /**
     * Setup feature card hover effects
     */
    setupFeatureCardEffects() {
        const featureCards = document.querySelectorAll('.feature-card');
        
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(card.querySelector('.feature-icon'), {
                        duration: 0.3,
                        scale: 1.1,
                        rotation: 5,
                        ease: 'power2.out'
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(card.querySelector('.feature-icon'), {
                        duration: 0.3,
                        scale: 1,
                        rotation: 0,
                        ease: 'power2.out'
                    });
                }
            });
        });
    }

    /**
     * Setup email copy functionality
     */
    setupEmailCopyFeature() {
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        
        emailLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const email = link.textContent.trim();
                
                // Copy to clipboard
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(email).then(() => {
                        this.showToast('Email copied to clipboard!', 'success');
                    }).catch(() => {
                        // Fallback for older browsers
                        this.fallbackCopyTextToClipboard(email);
                    });
                } else {
                    this.fallbackCopyTextToClipboard(email);
                }
            });
        });
    }

    /**
     * Fallback copy method for older browsers
     */
    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Avoid scrolling to bottom
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showToast('Email copied to clipboard!', 'success');
            } else {
                this.showToast('Failed to copy email', 'error');
            }
        } catch (err) {
            this.showToast('Failed to copy email', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * Setup FAQ interactions
     */
    setupFAQInteractions() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            item.style.cursor = 'pointer';
            
            item.addEventListener('click', () => {
                const content = item.querySelector('p');
                const isExpanded = content.style.maxHeight && content.style.maxHeight !== '0px';
                
                if (isExpanded) {
                    // Collapse
                    content.style.maxHeight = '0px';
                    content.style.overflow = 'hidden';
                    content.style.transition = 'max-height 0.3s ease-out';
                } else {
                    // Expand
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.overflow = 'visible';
                    content.style.transition = 'max-height 0.3s ease-in';
                }
            });
        });
    }

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Setup tooltips for interactive elements
     */
    setupTooltips() {
        const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');
        
        elementsWithTooltips.forEach(element => {
            let tooltip;
            
            element.addEventListener('mouseenter', () => {
                const tooltipText = element.getAttribute('data-tooltip');
                
                tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = tooltipText;
                tooltip.style.cssText = `
                    position: absolute;
                    background: var(--dark-brown);
                    color: var(--white);
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    white-space: nowrap;
                    z-index: 1000;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                `;
                
                document.body.appendChild(tooltip);
                
                // Position tooltip
                const rect = element.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                
                // Show tooltip
                setTimeout(() => {
                    tooltip.style.opacity = '1';
                }, 10);
            });
            
            element.addEventListener('mouseleave', () => {
                if (tooltip) {
                    tooltip.remove();
                    tooltip = null;
                }
            });
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    openModal.classList.remove('show');
                }
            }
            
            // Enter key on buttons
            if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
                e.target.click();
            }
        });
    }

    /**
     * Open authentication modal
     */
    openAuthModal(mode = 'login') {
        // This function should be available from auth.js
        if (typeof window.authManager !== 'undefined') {
            window.authManager.showAuthModal(mode);
        } else {
            console.warn('Auth manager not available');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // This function should be available from main.js or auth.js
        if (typeof window.showToast !== 'undefined') {
            window.showToast(message, type);
        } else {
            // Fallback alert
            alert(message);
        }
    }
}

// Initialize pages manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PagesManager();
});

// Export for use in other modules
window.PagesManager = PagesManager; 