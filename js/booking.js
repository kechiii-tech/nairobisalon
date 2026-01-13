// booking.js - Booking Page Specific Functionality

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('bookingForm')) {
        initBookingPage();
    }
});

function initBookingPage() {
    const bookingForm = document.getElementById('bookingForm');
    const dateInput = document.getElementById('date');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
    
    // Populate time slots based on selected date
    dateInput.addEventListener('change', updateTimeSlots);
    updateTimeSlots();
    
    // Form submission
    bookingForm.addEventListener('submit', handleBookingSubmission);
    
    // Initialize location-specific tips
    initLocationTips();
}

function updateTimeSlots() {
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const selectedDate = new Date(dateInput.value);
    const dayOfWeek = selectedDate.getDay();
    
    // Clear existing options except the first
    while (timeSelect.options.length > 1) {
        timeSelect.remove(1);
    }
    
    // Define time slots based on day
    let timeSlots;
    if (dayOfWeek === 0) { // Sunday
        timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00'];
    } else if (dayOfWeek === 6) { // Saturday
        timeSlots = ['9:00', '10:30', '12:00', '13:30', '15:00', '16:30'];
    } else { // Weekdays
        timeSlots = ['9:00', '10:30', '12:00', '14:00', '15:30', '17:00'];
    }
    
    // Add time slots
    timeSlots.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        
        // Convert to 12-hour format for display
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        option.textContent = `${displayHour}:${minutes} ${ampm}`;
        
        timeSelect.appendChild(option);
    });
}

function initLocationTips() {
    const locationSelect = document.getElementById('location');
    const tipsContainer = document.createElement('div');
    tipsContainer.id = 'locationTips';
    tipsContainer.style.cssText = `
        margin-top: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 5px;
        border-left: 4px solid var(--primary-bronze);
        display: none;
    `;
    
    locationSelect.parentNode.appendChild(tipsContainer);
    
    locationSelect.addEventListener('change', function() {
        const location = this.value;
        let tips = '';
        
        switch(location) {
            case 'westlands':
                tips = '<strong>Westlands Salon Tip:</strong> Avoid booking between 5-7 PM due to heavy traffic. Free parking available in the basement.';
                break;
            case 'kilimani':
                tips = '<strong>Kilimani Salon Tip:</strong> Street parking available on Dennis Pritt Road. Evening appointments recommended.';
                break;
            case 'karen':
                tips = '<strong>Karen Salon Tip:</strong> Ample parking space. Weekend appointments fill up quickly - book in advance.';
                break;
            case 'cbd':
                tips = '<strong>CBD Salon Tip:</strong> Limited parking. Consider using Uber/Taxi. Best times: Weekday mornings or Saturdays.';
                break;
            default:
                tips = '';
        }
        
        if (tips) {
            tipsContainer.innerHTML = `<i class="fas fa-info-circle" style="color: var(--primary-bronze); margin-right: 8px;"></i> ${tips}`;
            tipsContainer.style.display = 'block';
        } else {
            tipsContainer.style.display = 'none';
        }
    });
}

function handleBookingSubmission(e) {
    e.preventDefault();
    
    // Get form values
    const formData = {
        service: document.getElementById('service').value,
        serviceName: document.getElementById('service').options[document.getElementById('service').selectedIndex].text,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        location: document.getElementById('location').value,
        locationName: document.getElementById('location').options[document.getElementById('location').selectedIndex].text,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString(),
        status: 'pending',
        id: Date.now() + Math.floor(Math.random() * 1000)
    };
    
    // Validate phone number (Kenyan format)
    const phoneRegex = /^(?:254|\+254|0)?(7[0-9]{8})$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        showNotification('Please enter a valid Kenyan phone number', 'error');
        return;
    }
    
    // Validate email if provided
    if (formData.email && !isValidEmail(formData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Save booking
    saveBookingToStorage(formData);
    
    // Show success message
    showBookingConfirmation(formData);
    
    // Reset form
    document.getElementById('bookingForm').reset();
    
    // Reset date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('date').value = tomorrow.toISOString().split('T')[0];
    
    // Update time slots
    updateTimeSlots();
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function saveBookingToStorage(bookingData) {
    let bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
    bookings.push(bookingData);
    localStorage.setItem('salonBookings', JSON.stringify(bookings));
    
    // Also store in session storage for immediate access
    sessionStorage.setItem('latestBooking', JSON.stringify(bookingData));
}

function showBookingConfirmation(bookingData) {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.id = 'confirmationModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    // Format date
    const bookingDate = new Date(bookingData.date);
    const formattedDate = bookingDate.toLocaleDateString('en-KE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; width: 100%; position: relative;">
            <button onclick="closeConfirmationModal()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: #d4edda; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i class="fas fa-check" style="font-size: 2.5rem; color: #28a745;"></i>
                </div>
                <h2 style="color: var(--primary-bronze); margin-bottom: 10px;">Booking Confirmed!</h2>
                <p>Your appointment has been scheduled successfully.</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="margin-bottom: 15px; color: var(--neutral-gray);">Appointment Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong>Service:</strong><br>
                        ${bookingData.serviceName}
                    </div>
                    <div>
                        <strong>Date & Time:</strong><br>
                        ${formattedDate}<br>
                        ${bookingData.time}
                    </div>
                    <div>
                        <strong>Location:</strong><br>
                        ${bookingData.locationName}
                    </div>
                    <div>
                        <strong>Booking ID:</strong><br>
                        #${bookingData.id.toString().slice(-6)}
                    </div>
                </div>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
                <h4 style="margin-bottom: 10px; color: #856404;"><i class="fas fa-info-circle"></i> Next Steps</h4>
                <ol style="padding-left: 20px; margin: 0;">
                    <li>We'll call you at ${bookingData.phone} within 30 minutes to confirm</li>
                    <li>You can pay via M-Pesa (Paybill: 123456) or at the salon</li>
                    <li>Arrive 10 minutes before your appointment</li>
                </ol>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="closeConfirmationModal()" style="padding: 10px 20px; background: var(--primary-bronze); color: white; border: none; border-radius: 5px; cursor: pointer;">Done</button>
                <button onclick="printConfirmation()" style="padding: 10px 20px; background: white; color: var(--primary-bronze); border: 1px solid var(--primary-bronze); border-radius: 5px; cursor: pointer;"><i class="fas fa-print"></i> Print</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function printConfirmation() {
    const latestBooking = sessionStorage.getItem('latestBooking');
    if (latestBooking) {
        const booking = JSON.parse(latestBooking);
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Booking Confirmation - Nairobi Premier Salon</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { color: #CD7F32; font-size: 24px; font-weight: bold; }
                    .details { margin: 30px 0; }
                    .detail-row { margin-bottom: 10px; }
                    .label { font-weight: bold; display: inline-block; width: 150px; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">Nairobi Premier Salon</div>
                    <h1>Booking Confirmation</h1>
                    <p>Thank you for booking with us!</p>
                </div>
                
                <div class="details">
                    <div class="detail-row">
                        <span class="label">Booking ID:</span> #${booking.id.toString().slice(-6)}
                    </div>
                    <div class="detail-row">
                        <span class="label">Client Name:</span> ${booking.name}
                    </div>
                    <div class="detail-row">
                        <span class="label">Service:</span> ${booking.serviceName}
                    </div>
                    <div class="detail-row">
                        <span class="label">Date:</span> ${new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div class="detail-row">
                        <span class="label">Time:</span> ${booking.time}
                    </div>
                    <div class="detail-row">
                        <span class="label">Location:</span> ${booking.locationName}
                    </div>
                    <div class="detail-row">
                        <span class="label">Phone:</span> ${booking.phone}
                    </div>
                    ${booking.email ? `
                    <div class="detail-row">
                        <span class="label">Email:</span> ${booking.email}
                    </div>
                    ` : ''}
                </div>
                
                <div class="footer">
                    <p><strong>Important Notes:</strong></p>
                    <ul>
                        <li>Please arrive 10 minutes before your appointment</li>
                        <li>Bring this confirmation with you</li>
                        <li>Cancellations must be made 24 hours in advance</li>
                        <li>Contact us at +254 700 123 456 for any changes</li>
                    </ul>
                    <p style="margin-top: 20px;">Generated on ${new Date().toLocaleString()}</p>
                </div>
                
                <button onclick="window.print()" style="padding: 10px 20px; background: #CD7F32; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">Print this Confirmation</button>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
}

// Add to global scope for modal buttons
window.closeConfirmationModal = closeConfirmationModal;
window.printConfirmation = printConfirmation;