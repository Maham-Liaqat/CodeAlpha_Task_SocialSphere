import { Auth } from './auth.js';
import { UI } from './ui.js';
import { API } from './api.js';
import './events.js'; // Import event handlers

class SocialMediaApp {
    constructor() {
        this.api = new API();
        this.auth = new Auth(this.api);
        this.ui = new UI(this.auth, this.api);
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            try {
                this.currentUser = await this.auth.getCurrentUser();
                this.ui.showApp();
                this.ui.attachCreatePostListener();
                this.ui.attachSearchListener();
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
                this.ui.showAuth();
            }
        } else {
            this.ui.showAuth();
        }

        // Add global error handler
        this.setupErrorHandling();
    }

    setupErrorHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.ui.notification.show('Something went wrong', 'error');
        });

        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SocialMediaApp();
});

// Make app globally available for debugging
export { SocialMediaApp };