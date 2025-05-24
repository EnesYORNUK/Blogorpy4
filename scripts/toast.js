// Toast Notification System
class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    show(message, type = 'info', title = '', duration = 5000) {
        const toast = this.createToast(message, type, title, duration);
        this.container.appendChild(toast);
        this.toasts.push(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        return toast;
    }

    createToast(message, type, title, duration) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const icon = icons[type] || icons.info;
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
            <div class="toast-progress"></div>
        `;

        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.remove(toast);
        });

        return toast;
    }

    remove(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.add('slide-out');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    success(message, title = 'Başarılı!') {
        return this.show(message, 'success', title);
    }

    error(message, title = 'Hata!') {
        return this.show(message, 'error', title);
    }

    warning(message, title = 'Uyarı!') {
        return this.show(message, 'warning', title);
    }

    info(message, title = 'Bilgi') {
        return this.show(message, 'info', title);
    }

    // Clear all toasts
    clear() {
        this.toasts.forEach(toast => {
            this.remove(toast);
        });
    }
}

// Create global toast instance
window.toast = new ToastManager();

// Global toast functions for easy access
window.showToast = (message, type, title, duration) => {
    return window.toast.show(message, type, title, duration);
};

window.showSuccess = (message, title) => {
    return window.toast.success(message, title);
};

window.showError = (message, title) => {
    return window.toast.error(message, title);
};

window.showWarning = (message, title) => {
    return window.toast.warning(message, title);
};

window.showInfo = (message, title) => {
    return window.toast.info(message, title);
}; 