// Authentication system with secure password hashing
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
    
    // --- Secure password hashing using Web Crypto API ---
    async hashPassword(password, salt) {
        if (!salt) {
            const saltArray = new Uint8Array(16);
            crypto.getRandomValues(saltArray);
            salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        const encoder = new TextEncoder();
        const data = encoder.encode(salt + password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return { hash, salt };
    }
    
    async verifyPassword(password, storedHash, storedSalt) {
        const { hash } = await this.hashPassword(password, storedSalt);
        return hash === storedHash;
    }
    
    setupEventListeners() {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
        
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('register');
        });
        
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });
        
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
    
    async register() {
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
        
        if (this.users.some(user => user.email === email)) {
            alert('User with this email already exists!');
            return;
        }
        
        // Hash password with random salt
        const { hash, salt } = await this.hashPassword(password);
        
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            passwordHash: hash,
            passwordSalt: salt,
            registrationDate: new Date().toISOString(),
            progress: {}
        };
        
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        alert('Registration successful! You can now login.');
        this.showForm('login');
    }
    
    async login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Find user by email
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            alert('Invalid email or password!');
            return;
        }
        
        // Support legacy btoa-encoded passwords (auto-migrate on login)
        if (user.password && !user.passwordHash) {
            try {
                const decoded = atob(user.password);
                if (decoded === password) {
                    // Migrate to hashed password
                    const { hash, salt } = await this.hashPassword(password);
                    user.passwordHash = hash;
                    user.passwordSalt = salt;
                    delete user.password;
                    localStorage.setItem('users', JSON.stringify(this.users));
                } else {
                    alert('Invalid email or password!');
                    return;
                }
            } catch {
                alert('Invalid email or password!');
                return;
            }
        } else {
            // Verify hashed password
            const valid = await this.verifyPassword(password, user.passwordHash, user.passwordSalt);
            if (!valid) {
                alert('Invalid email or password!');
                return;
            }
        }
        
        this.currentUser = user;
        // Store session reference (not the password)
        const sessionUser = { ...user };
        delete sessionUser.passwordHash;
        delete sessionUser.passwordSalt;
        delete sessionUser.password;
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        this.showApp();
        this.updateUserInfo();
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
        
        this.currentUser.progress[courseId].totalXP = Object.values(
            this.currentUser.progress[courseId].levels
        ).reduce((sum, level) => sum + (level.xp || 0), 0);
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
        }
        
        const sessionUser = { ...this.currentUser };
        delete sessionUser.passwordHash;
        delete sessionUser.passwordSalt;
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
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
