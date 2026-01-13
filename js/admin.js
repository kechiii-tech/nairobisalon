// admin.js - Admin Dashboard Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Initialize admin dashboard
    initDashboard();
    
    // Load bookings
    loadBookings();
    
    // Initialize event listeners
    initEventListeners();
});

// Check Authentication
function checkAuth() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
        window.location.href = 'admin-login.html';
    }
}

// Initialize Dashboard
function initDashboard() {
    updateStats();
    loadRecentActivity();
}

// Update Dashboard Statistics
function updateStats() {
    const bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
    const today = new Date().toDateString();
    
    const stats = {
        totalBookings: bookings.length,
        todayBookings: bookings.filter(b => new Date(b.date).toDateString() === today).length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        revenue: bookings.filter(b => b.status === 'confirmed').length * 2500 // Sample calculation
    };
    
    // Update stats cards
    const statsCards = document.getElementById('statsCards');
    statsCards.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon blue">
                <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.totalBookings}</h3>
                <p>Total Bookings</p>
            </div>
            <div class="stat-change positive">
                +${stats.todayBookings} today
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange">
                <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.pendingBookings}</h3>
                <p>Pending Approval</p>
            </div>
            <div class="stat-change ${stats.pendingBookings > 0 ? 'negative' : 'positive'}">
                ${stats.pendingBookings > 0 ? 'Needs attention' : 'All clear'}
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green">
                <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="stat-info">
                <h3>KES ${stats.revenue.toLocaleString()}</h3>
                <p>Monthly Revenue</p>
            </div>
            <div class="stat-change positive">
                +12.5%
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon red">
                <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
                <h3>${new Set(bookings.map(b => b.phone)).size}</h3>
                <p>Unique Clients</p>
            </div>
            <div class="stat-change positive">
                +8 this month
            </div>
        </div>
    `;
    
    // Update pending count in sidebar
    const pendingCount = document.getElementById('pendingCount');
    if (pendingCount) {
        pendingCount.textContent = stats.pendingBookings;
    }
}

// Load Bookings
function loadBookings(page = 1, itemsPerPage = 10) {
    const bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
    const tableBody = document.getElementById('bookingsTableBody');
    
    // Sort by date (newest first)
    bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Calculate pagination
    const totalPages = Math.ceil(bookings.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageBookings = bookings.slice(startIndex, endIndex);
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (pageBookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px;">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; color: #ccc; margin-bottom: 15px; display: block;"></i>
                    <p>No bookings found</p>
                </td>
            </tr>
        `;
    } else {
        pageBookings.forEach(booking => {
            const row = document.createElement('tr');
            
            // Format date
            const bookingDate = new Date(booking.date);
            const formattedDate = bookingDate.toLocaleDateString('en-KE', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Status badge
            let statusBadge;
            switch(booking.status) {
                case 'pending':
                    statusBadge = '<span class="status-badge status-pending">Pending</span>';
                    break;
                case 'confirmed':
                    statusBadge = '<span class="status-badge status-confirmed">Confirmed</span>';
                    break;
                case 'cancelled':
                    statusBadge = '<span class="status-badge status-cancelled">Cancelled</span>';
                    break;
                case 'completed':
                    statusBadge = '<span class="status-badge status-completed">Completed</span>';
                    break;
                default:
                    statusBadge = '<span class="status-badge status-pending">Pending</span>';
            }
            
            // Estimate amount based on service
            let amount = 'KES 2,500';
            if (booking.service === 'manicure') amount = 'KES 1,200';
            if (booking.service === 'haircut') amount = 'KES 1,800';
            if (booking.service === 'bridal') amount = 'KES 15,000';
            
            row.innerHTML = `
                <td>#${booking.id.toString().slice(-6)}</td>
                <td><strong>${booking.name}</strong></td>
                <td>${getServiceName(booking.service)}</td>
                <td>${formattedDate}<br><small>${booking.time}</small></td>
                <td>${getLocationName(booking.location)}</td>
                <td>${booking.phone}<br><small>${booking.email || 'No email'}</small></td>
                <td>${amount}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewBooking(${booking.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editBooking(${booking.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteBooking(${booking.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Update pagination info
    document.getElementById('currentPage').textContent = page;
    document.getElementById('totalPages').textContent = totalPages;
    
    // Update pagination buttons
    document.getElementById('prevPage').disabled = page <= 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

// Get Service Name from value
function getServiceName(serviceValue) {
    const services = {
        'braiding': 'Braiding & Weaving',
        'haircut': 'Haircut & Styling',
        'manicure': 'Manicure & Pedicure',
        'facial': 'Facial Treatment',
        'massage': 'Spa Massage',
        'bridal': 'Bridal Package'
    };
    return services[serviceValue] || serviceValue;
}

// Get Location Name from value
function getLocationName(locationValue) {
    const locations = {
        'westlands': 'Westlands',
        'kilimani': 'Kilimani',
        'karen': 'Karen',
        'cbd': 'Nairobi CBD'
    };
    return locations[locationValue] || locationValue;
}

// View Booking Details
function viewBooking(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
        alert('Booking not found');
        return;
    }
    
    const modal = document.getElementById('bookingModal');
    const details = document.getElementById('bookingDetails');
    
    details.innerHTML = `
        <div class="booking-details-grid">
            <div class="detail-item">
                <label>Booking ID</label>
                <p>#${booking.id.toString().slice(-6)}</p>
            </div>
            <div class="detail-item">
                <label>Client Name</label>
                <p>${booking.name}</p>
            </div>
            <div class="detail-item">
                <label>Service</label>
                <p>${getServiceName(booking.service)}</p>
            </div>
            <div class="detail-item">
                <label>Date & Time</label>
                <p>${new Date(booking.date).toLocaleDateString()} at ${booking.time}</p>
            </div>
            <div class="detail-item">
                <label>Location</label>
                <p>${getLocationName(booking.location)} Salon</p>
            </div>
            <div class="detail-item">
                <label>Contact</label>
                <p>Phone: ${booking.phone}</p>
                <p>Email: ${booking.email || 'Not provided'}</p>
            </div>
            <div class="detail-item">
                <label>Status</label>
                <p><span class="status-badge status-${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></p>
            </div>
            <div class="detail-item">
                <label>Submitted</label>
                <p>${new Date(booking.timestamp).toLocaleString()}</p>
            </div>
        </div>
        ${booking.notes ? `
            <div class="detail-item" style="grid-column: 1 / -1;">
                <label>Additional Notes</label>
                <p style="background: #f8f9fa; padding: 15px; border-radius: 5px;">${booking.notes}</p>
            </div>
        ` : ''}
    `;
    
    // Store current booking ID in modal for actions
    modal.dataset.bookingId = bookingId;
    modal.style.display = 'flex';
}

// Close Modal
function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

// Confirm Booking
function confirmBooking() {
    const modal = document.getElementById('bookingModal');
    const bookingId = parseInt(modal.dataset.bookingId);
    
    let bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'confirmed';
        localStorage.setItem('salonBookings', JSON.stringify(bookings));
        
        // Update UI
        loadBookings();
        updateStats();
        loadRecentActivity();
        
        // Show notification
        showAdminNotification('Booking confirmed successfully', 'success');
        closeModal();
    }
}

// Cancel Booking
function cancelBooking() {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    const modal = document.getElementById('bookingModal');
    const bookingId = parseInt(modal.dataset.bookingId);
    
    let bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'cancelled';
        localStorage.setItem('salonBookings', JSON.stringify(bookings));
        
        // Update UI
        loadBookings();
        updateStats();
        loadRecentActivity();
        
        // Show notification
        showAdminNotification('Booking cancelled', 'info');
        closeModal();
    }
}

// Delete Booking
function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;
    
    let bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
    bookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('salonBookings', JSON.stringify(bookings));
    
    // Update UI
    loadBookings();
    updateStats();
    loadRecentActivity();
    
    // Show notification
    showAdminNotification('Booking deleted successfully', 'success');
}

// Edit Booking
function editBooking(bookingId) {
    alert('Edit functionality would open a form to modify booking details. This is a demo feature.');
}

// Load Recent Activity
function loadRecentActivity() {
    const bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
    const activityFeed = document.getElementById('activityFeed');
    
    // Sort by timestamp (newest first) and take latest 5
    const recentBookings = bookings
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    activityFeed.innerHTML = '';
    
    recentBookings.forEach(booking => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Determine icon based on service
        let icon = 'fa-calendar-plus';
        if (booking.service === 'braiding') icon = 'fa-hands';
        if (booking.service === 'haircut') icon = 'fa-cut';
        if (booking.service === 'manicure') icon = 'fa-hand-sparkles';
        if (booking.service === 'bridal') icon = 'fa-heart';
        
        // Determine status color
        let statusColor = '#ffc107';
        if (booking.status === 'confirmed') statusColor = '#28a745';
        if (booking.status === 'cancelled') statusColor = '#dc3545';
        
        const timeAgo = getTimeAgo(new Date(booking.timestamp));
        
        activityItem.innerHTML = `
            <div class="activity-icon" style="background: ${statusColor}20; color: ${statusColor};">
                <i class="fas ${icon}"></i>
            </div>
            <div class="activity-content">
                <p><strong>${booking.name}</strong> booked ${getServiceName(booking.service)}</p>
                <p class="activity-time">${timeAgo} • ${getLocationName(booking.location)}</p>
            </div>
            <span class="status-badge status-${booking.status}">${booking.status}</span>
        `;
        activityFeed.appendChild(activityItem);
    });
}

// Get Time Ago
function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
    
    return Math.floor(seconds) + ' second' + (seconds === 1 ? '' : 's') + ' ago';
}

// Initialize Event Listeners
function initEventListeners() {
    // Pagination buttons
    document.getElementById('prevPage').addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('currentPage').textContent);
        if (currentPage > 1) loadBookings(currentPage - 1);
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('currentPage').textContent);
        const totalPages = parseInt(document.getElementById('totalPages').textContent);
        if (currentPage < totalPages) loadBookings(currentPage + 1);
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('bookingModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Refresh Bookings
function refreshBookings() {
    loadBookings();
    updateStats();
    showAdminNotification('Bookings refreshed', 'info');
}

// Export Bookings
function exportBookings() {
    const bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
    
    // Convert to CSV
    const csv = convertToCSV(bookings);
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salon-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showAdminNotification('Bookings exported successfully', 'success');
}

// Convert to CSV
function convertToCSV(data) {
    const headers = ['ID', 'Name', 'Service', 'Date', 'Time', 'Location', 'Phone', 'Email', 'Status', 'Notes'];
    const rows = data.map(booking => [
        booking.id,
        `"${booking.name}"`,
        getServiceName(booking.service),
        booking.date,
        booking.time,
        getLocationName(booking.location),
        booking.phone,
        booking.email || '',
        booking.status,
        `"${booking.notes || ''}"`
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// Show Admin Notification
function showAdminNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `admin-notification admin-notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Demo functions for quick actions
function addNewService() {
    showAdminNotification('This would open a form to add new service', 'info');
}

function sendBroadcast() {
    showAdminNotification('This would open broadcast message panel', 'info');
}

function generateReport() {
    showAdminNotification('Generating monthly report...', 'info');
    setTimeout(() => {
        showAdminNotification('Monthly report generated successfully', 'success');
    }, 2000);
}

function manageStaff() {
    showAdminNotification('This would open staff management panel', 'info');
}