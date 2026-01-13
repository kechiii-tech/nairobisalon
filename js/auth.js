// auth.js - Authentication for Admin Dashboard

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
    
    // Demo credentials
    const demoCredentials = {
        username: 'admin',
        password: 'nairobisalon2024'
    };
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Check credentials
        if (username === demoCredentials.username && password === demoCredentials.password) {
            // Set authentication
            localStorage.setItem('adminAuthenticated', 'true');
            localStorage.setItem('adminUsername', username);
            localStorage.setItem('adminLoginTime', new Date().toISOString());
            
            // Redirect to admin dashboard
            window.location.href = 'admin.html';
        } else {
            // Show error
            errorMessage.style.display = 'block';
            
            // Shake animation
            loginForm.style.animation = 'shake 0.5s';
            setTimeout(() => {
                loginForm.style.animation = '';
            }, 500);
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

// Initialize Admin Authentication
function initAdminAuth() {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    
    if (!isAuthenticated) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Display admin info
    const username = localStorage.getItem('adminUsername');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    // Update admin role display if exists
    const adminRoleElement = document.querySelector('.admin-role');
    if (adminRoleElement) {
        adminRoleElement.textContent = `Logged in as ${username}`;
    }
    
    // Auto logout after 2 hours
    if (loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = Math.abs(now - loginDate) / 36e5;
        
        if (hoursDiff > 2) {
            logout();
        }
    }
}

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'admin-login.html';
    }
}

// Check Session (run periodically)
setInterval(() => {
    if (window.location.pathname.includes('admin.html')) {
        initAdminAuth();
    }
}, 60000); // Check every minute
