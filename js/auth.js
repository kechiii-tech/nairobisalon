// auth.js - Enhanced Security Version
// IMPORTANT: This is still client-side and not 100% secure
// For production, use a proper backend with server-side authentication

// Obfuscated credentials (basic protection)
const ADMIN_CREDENTIALS = {
    username: btoa('kipkoech').split('').reverse().join(''),
    password: btoa('sourcecode').split('').reverse().join('')
};

// Login attempts tracking
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 300000; // 5 minutes in milliseconds

// Function to check if user is locked out
function isLockedOut() {
    const lockoutUntil = localStorage.getItem('lockoutUntil');
    if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
        return true;
    }
    return false;
}

// Function to set lockout
function setLockout() {
    const lockoutUntil = Date.now() + LOCKOUT_DURATION;
    localStorage.setItem('lockoutUntil', lockoutUntil.toString());
}

// Function to clear lockout
function clearLockout() {
    localStorage.removeItem('lockoutUntil');
    localStorage.removeItem('loginAttempts');
}

// Function to get login attempts
function getLoginAttempts() {
    return parseInt(localStorage.getItem('loginAttempts') || '0');
}

// Function to increment login attempts
function incrementLoginAttempts() {
    const attempts = getLoginAttempts() + 1;
    localStorage.setItem('loginAttempts', attempts.toString());
    
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
        setLockout();
        return true; // Locked out
    }
    return false;
}

// Function to reset login attempts
function resetLoginAttempts() {
    localStorage.removeItem('loginAttempts');
}

// Deobfuscate function
function deobfuscate(str) {
    return atob(str.split('').reverse().join(''));
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on login page
    if (document.getElementById('loginForm')) {
        initLoginForm();
    }
    
    // Check if we're on admin page
    if (document.querySelector('.admin-container')) {
        initAdminAuth();
    }
});

// Initialize Login Form
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    // Check for lockout
    if (isLockedOut()) {
        const lockoutUntil = parseInt(localStorage.getItem('lockoutUntil'));
        const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000 / 60);
        errorMessage.innerHTML = `<i class="fas fa-lock"></i> Too many failed attempts. Please try again in ${remainingTime} minutes.`;
        errorMessage.style.display = 'block';
        loginForm.style.opacity = '0.5';
        loginForm.style.pointerEvents = 'none';
        
        // Auto-enable form after lockout
        setTimeout(() => {
            clearLockout();
            loginForm.style.opacity = '1';
            loginForm.style.pointerEvents = 'auto';
            errorMessage.style.display = 'none';
        }, LOCKOUT_DURATION);
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Check lockout
        if (isLockedOut()) {
            errorMessage.innerHTML = `<i class="fas fa-lock"></i> Account is temporarily locked. Please wait.`;
            errorMessage.style.display = 'block';
            return;
        }
        
        // Deobfuscate and compare
        const validUsername = deobfuscate(ADMIN_CREDENTIALS.username);
        const validPassword = deobfuscate(ADMIN_CREDENTIALS.password);
        
        if (username === validUsername && password === validPassword) {
            // Successful login
            resetLoginAttempts();
            
            // Generate session token
            const sessionToken = generateSessionToken();
            
            // Set authentication with expiration
            const loginData = {
                authenticated: true,
                username: username,
                token: sessionToken,
                expiry: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
            };
            
            localStorage.setItem('adminAuth', JSON.stringify(loginData));
            sessionStorage.setItem('adminSession', sessionToken);
            
            // Set login time for auto-logout
            localStorage.setItem('adminLoginTime', new Date().toISOString());
            
            // Redirect to admin dashboard
            window.location.href = 'admin.html';
        } else {
            // Failed login
            const lockedOut = incrementLoginAttempts();
            
            if (lockedOut) {
                errorMessage.innerHTML = `<i class="fas fa-lock"></i> Too many failed attempts. Account locked for 5 minutes.`;
                errorMessage.style.display = 'block';
                loginForm.style.opacity = '0.5';
                loginForm.style.pointerEvents = 'none';
                
                setTimeout(() => {
                    clearLockout();
                    loginForm.style.opacity = '1';
                    loginForm.style.pointerEvents = 'auto';
                    errorMessage.style.display = 'none';
                }, LOCKOUT_DURATION);
            } else {
                const attemptsLeft = MAX_LOGIN_ATTEMPTS - getLoginAttempts();
                errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> Invalid credentials. ${attemptsLeft} attempt(s) remaining.`;
                errorMessage.style.display = 'block';
                
                // Shake animation
                loginForm.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    loginForm.style.animation = '';
                }, 500);
            }
        }
    });
    
    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}

// Generate session token
function generateSessionToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token + Date.now().toString(36);
}

// Initialize Admin Authentication
function initAdminAuth() {
    // Check if user is authenticated
    const authData = JSON.parse(localStorage.getItem('adminAuth'));
    const sessionToken = sessionStorage.getItem('adminSession');
    
    if (!authData || !authData.authenticated || !sessionToken || authData.token !== sessionToken) {
        logout(true);
        return;
    }
    
    // Check if session expired
    if (Date.now() > authData.expiry) {
        logout(true);
        return;
    }
    
    // Check auto-logout after 2 hours
    const loginTime = localStorage.getItem('adminLoginTime');
    if (loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = Math.abs(now - loginDate) / 36e5;
        
        if (hoursDiff > 2) {
            logout(true);
        }
    }
    
    // Display admin info
    const username = authData.username;
    const adminRoleElement = document.querySelector('.admin-role');
    if (adminRoleElement) {
        adminRoleElement.textContent = `Logged in as ${username}`;
    }
    
    // Update session expiry (extend on activity)
    authData.expiry = Date.now() + (2 * 60 * 60 * 1000);
    localStorage.setItem('adminAuth', JSON.stringify(authData));
}

// Logout Function
function logout(silent = false) {
    if (!silent) {
        if (!confirm('Are you sure you want to logout?')) return;
    }
    
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminLoginTime');
    sessionStorage.removeItem('adminSession');
    
    if (!silent) {
        window.location.href = 'admin-login.html';
    } else {
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 100);
    }
}

// Check Session (run periodically)
setInterval(() => {
    if (window.location.pathname.includes('admin.html')) {
        initAdminAuth();
    }
}, 60000); // Check every minute

// Clear sensitive data on page unload
window.addEventListener('beforeunload', function() {
    // Don't clear if just navigating within admin area
    if (!window.location.pathname.includes('admin')) {
        sessionStorage.removeItem('adminSession');
    }
});

// Add logout button event listener globally
document.addEventListener('click', function(e) {
    if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
        logout();
    }
});