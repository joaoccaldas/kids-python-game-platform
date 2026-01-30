// Authentication system
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }
    
    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        
        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
        
        // Switch between forms
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('register');
        });
        
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });
        
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }
    
    showForm(formType) {
        if (formType === 'login') {
            document.getElementById('login-form-container').style.display = 'block';
            document.getElementById('register-form-container').style.display = 'none';
        } else {
            document.getElementById('login-form-container').style.display = 'none';
            document.getElementById('register-form-container').style.display = 'block';
        }
    }
    
    register() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }
        
        // Check if user already exists
        if (this.users.some(user => user.email === email)) {
            alert('User with this email already exists!');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: btoa(password), // Simple base64 encoding for demo purposes
            registrationDate: new Date().toISOString(),
            progress: {} // Will store progress for different courses
        };
        
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        alert('Registration successful! You can now login.');
        this.showForm('login');
    }
    
    login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const user = this.users.find(u => u.email === email && u.password === btoa(password));
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showApp();
            this.updateUserInfo();
            console.log('Login successful', user);
        } else {
            alert('Invalid email or password!');
        }
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showAuthModal();
    }
    
    checkAuthStatus() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showApp();
            this.updateUserInfo();
        } else {
            this.showAuthModal();
        }
    }
    
    showAuthModal() {
        document.getElementById('auth-modal').style.display = 'block';
        document.getElementById('app').style.display = 'none';
    }
    
    showApp() {
        document.getElementById('auth-modal').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
    }
    
    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('user-name').textContent = this.currentUser.name;
        }
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    updateUserProgress(courseId, levelId, completed, xp = 0) {
        if (!this.currentUser) return;
        
        if (!this.currentUser.progress[courseId]) {
            this.currentUser.progress[courseId] = {
                levels: {},
                totalXP: 0,
                lastAccessed: new Date().toISOString()
            };
        }
        
        this.currentUser.progress[courseId].levels[levelId] = {
            completed: completed,
            completedAt: new Date().toISOString(),
            xp: xp
        };
        
        // Update total XP
        this.currentUser.progress[courseId].totalXP = Object.values(
            this.currentUser.progress[courseId].levels
        ).reduce((sum, level) => sum + (level.xp || 0), 0);
        
        // Update in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
        }
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
    
    getUserProgress(courseId) {
        if (!this.currentUser) return null;
        return this.currentUser.progress[courseId] || { levels: {}, totalXP: 0 };
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});