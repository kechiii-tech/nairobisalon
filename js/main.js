// main.js - Main JavaScript for Nairobi Premier Salon Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Load featured services on home page
    if (document.getElementById('featuredServices')) {
        loadFeaturedServices();
    }
    
    // Load testimonials on home page
    if (document.getElementById('testimonialsContainer')) {
        loadTestimonials();
        initTestimonialSlider();
    }
    
    // Initialize gallery filtering on gallery page
    if (document.querySelector('.gallery-filter')) {
        initGalleryFilter();
    }
    
    // Initialize booking form on booking page
    if (document.getElementById('bookingForm')) {
        initBookingForm();
    }
    
    // Add animation to elements on scroll
    initScrollAnimation();
});

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });
    }
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Featured Services Data
const servicesData = [
    {
        id: 1,
        name: "Braiding & Weaving",
        price: "KES 2,500+",
        duration: "2-4 hours",
        image: "https://images.unsplash.com/photo-1596703923338-48f1c07e4f2e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
        description: "Expert braiding with premium hair extensions. Choose from box braids, cornrows, twists, and more."
    },
    {
        id: 2,
        name: "Haircut & Styling",
        price: "KES 1,800+",
        duration: "1 hour",
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
        description: "Precision haircuts and personalized styling for all hair types and textures."
    },
    {
        id: 3,
        name: "Manicure & Pedicure",
        price: "KES 1,200+",
        duration: "1.5 hours",
        image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
        description: "Luxurious nail care with gel polish, nail art, and spa treatments for hands and feet."
    }
];

// Load Featured Services
function loadFeaturedServices() {
    const servicesGrid = document.getElementById('featuredServices');
    
    servicesData.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <img src="${service.image}" alt="${service.name}" class="service-image">
            <div class="service-content">
                <div class="service-title">
                    <h3 class="service-name">${service.name}</h3>
                    <div class="service-price">${service.price}</div>
                </div>
                <p class="service-description">${service.description}</p>
                <div class="service-meta">
                    <span><i class="far fa-clock"></i> ${service.duration}</span>
                    <span><i class="fas fa-map-marker-alt"></i> All Locations</span>
                </div>
            </div>
        `;
        servicesGrid.appendChild(serviceCard);
    });
}

// Testimonials Data
const testimonialsData = [
    {
        name: "Sarah Wanjiku",
        location: "Kilimani, Nairobi",
        text: "As a busy executive in Nairobi, I appreciate how Nairobi Premier Salon understands our schedules. They accommodated my last-minute appointment and the braiding service was exceptional.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80"
    },
    {
        name: "James Omondi",
        location: "Westlands, Nairobi",
        text: "The barber shop at Nairobi Premier is exceptional. As someone who values grooming, I've tried many places in Nairobi, but this is by far the best.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    },
    {
        name: "Amina Hassan",
        location: "Karen, Nairobi",
        text: "My bridal package was absolutely perfect! The team understood exactly what I wanted for my traditional Kenyan wedding. Highly recommended for Nairobi brides!",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    }
];

// Load Testimonials
function loadTestimonials() {
    const testimonialsContainer = document.getElementById('testimonialsContainer');
    
    testimonialsData.forEach(testimonial => {
        const testimonialSlide = document.createElement('div');
        testimonialSlide.className = 'swiper-slide';
        testimonialSlide.innerHTML = `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <p>"${testimonial.text}"</p>
                </div>
                <div class="testimonial-author">
                    <img src="${testimonial.image}" alt="${testimonial.name}" class="author-img">
                    <div class="author-info">
                        <h4>${testimonial.name}</h4>
                        <div class="author-location">${testimonial.location}</div>
                    </div>
                </div>
            </div>
        `;
        testimonialsContainer.appendChild(testimonialSlide);
    });
}

// Initialize Testimonial Slider
function initTestimonialSlider() {
    const testimonialSwiper = new Swiper('.testimonialSwiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            }
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        }
    });
}

// Initialize Gallery Filtering
function initGalleryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Initialize Booking Form
function initBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    const dateInput = document.getElementById('date');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
    
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {
            service: document.getElementById('service').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            location: document.getElementById('location').value,
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString(),
            status: 'pending',
            id: Date.now() + Math.floor(Math.random() * 1000)
        };
        
        // Validate required fields
        if (!formData.service || !formData.date || !formData.time || !formData.name || !formData.phone || !formData.location) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Save booking to localStorage
        saveBooking(formData);
        
        // Show success message
        showNotification('Booking submitted successfully! We will contact you shortly.', 'success');
        
        // Reset form
        bookingForm.reset();
        
        // Reset date to tomorrow
        const newTomorrow = new Date();
        newTomorrow.setDate(newTomorrow.getDate() + 1);
        dateInput.value = newTomorrow.toISOString().split('T')[0];
    });
}

// Save Booking to localStorage
function saveBooking(bookingData) {
    let bookings = JSON.parse(localStorage.getItem('salonBookings')) || [];
    bookings.push(bookingData);
    localStorage.setItem('salonBookings', JSON.stringify(bookings));
    
    // Also save to session for admin access
    sessionStorage.setItem('latestBooking', JSON.stringify(bookingData));
}

// Show Notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Initialize Scroll Animation
function initScrollAnimation() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.service-card, .gallery-item, .feature, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}