// Local learner profile system.
// This static GitHub Pages app intentionally has no password/account authentication.
class AuthSystem {
    constructor() {
        this.storageKey = 'learnerProfile';
        this.currentUser = this.loadProfile();
        this.init();
    }

    loadProfile() {
        try {
            const saved = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
            if (saved && typeof saved === 'object') {
                return {
                    id: 'local-profile',
                    name: typeof saved.name === 'string' ? saved.name.slice(0, 40) : 'Learner',
                    progress: saved.progress && typeof saved.progress === 'object' ? saved.progress : {}
                };
            }
        } catch (_) {}
        return { id: 'local-profile', name: 'Learner', progress: {} };
    }

    saveProfile() {
        localStorage.setItem(this.storageKey, JSON.stringify({
            name: this.currentUser.name,
            progress: this.currentUser.progress
        }));
    }

    init() {
        // Remove any legacy credential-bearing local data created by older versions.
        localStorage.removeItem('users');
        localStorage.removeItem('currentUser');

        // This is a local profile, not an authentication boundary. Open the app directly.
        this.showApp();
        this.updateUserInfo();

        const logout = document.getElementById('logout-btn');
        if (logout) {
            logout.textContent = 'Reset local profile';
            logout.addEventListener('click', () => this.resetProfile());
        }
    }

    showApp() {
        const modal = document.getElementById('auth-modal');
        const app = document.getElementById('app');
        if (modal) modal.style.display = 'none';
        if (app) app.style.display = 'flex';
    }

    updateUserInfo() {
        const node = document.getElementById('user-name');
        if (node) node.textContent = this.currentUser.name;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateUserProgress(courseId, levelId, completed, xp = 0) {
        if (!this.currentUser.progress[courseId]) {
            this.currentUser.progress[courseId] = {
                levels: {},
                totalXP: 0,
                lastAccessed: new Date().toISOString()
            };
        }

        this.currentUser.progress[courseId].levels[levelId] = {
            completed,
            completedAt: new Date().toISOString(),
            xp
        };
        this.currentUser.progress[courseId].lastAccessed = new Date().toISOString();
        this.currentUser.progress[courseId].totalXP = Object.values(
            this.currentUser.progress[courseId].levels
        ).reduce((sum, level) => sum + (Number(level.xp) || 0), 0);
        this.saveProfile();
    }

    getUserProgress(courseId) {
        return this.currentUser.progress[courseId] || { levels: {}, totalXP: 0 };
    }

    resetProfile() {
        if (!window.confirm('Reset local learning progress on this browser?')) return;
        localStorage.removeItem(this.storageKey);
        this.currentUser = { id: 'local-profile', name: 'Learner', progress: {} };
        this.saveProfile();
        window.location.reload();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});
