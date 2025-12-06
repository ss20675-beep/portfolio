// Swipe Animation and Navigation
let currentSection = 0;
const sections = document.querySelectorAll('.section');
const dots = document.querySelectorAll('.dot');
const totalSections = sections.length;

// Initialize
function init() {
    showSection(currentSection);
    createWaterDroplets();
    createBackgroundParticles();
    setupEventListeners();
    hideSwipeInstruction();
    setupInteractiveImage();
}

// Keep swipe instruction visible on all pages
function hideSwipeInstruction() {
    const swipeInstruction = document.querySelector('.swipe-instruction');
    if (!swipeInstruction) return;
    
    // Keep it visible but make it fade slightly after first interaction
    let hasInteracted = false;
    
    const fadeSlightly = () => {
        if (!hasInteracted) {
            hasInteracted = true;
            swipeInstruction.style.opacity = '0.6';
            swipeInstruction.style.transition = 'opacity 0.5s ease-out';
        }
    };
    
    // Fade slightly on first interaction but keep visible
    document.addEventListener('touchstart', fadeSlightly, { once: true, passive: true });
    document.addEventListener('mousedown', fadeSlightly, { once: true });
    document.addEventListener('wheel', fadeSlightly, { once: true, passive: true });
    document.addEventListener('keydown', fadeSlightly, { once: true });
}

// Show specific section - optimized for performance
function showSection(index) {
    if (index === currentSection) return; // Prevent unnecessary updates
    
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
        // Remove active class from all sections
        sections.forEach((section, i) => {
            section.classList.remove('active', 'prev');
            if (i < index) {
                section.classList.add('prev');
            }
        });
        
        // Add active class to current section
        sections[index].classList.add('active');
        
        // Update navigation dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentSection = index;
    });
}

// Navigate to section
function scrollToSection(index) {
    if (index >= 0 && index < totalSections) {
        showSection(index);
    }
}

// Touch/Mouse swipe handling
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let isSwiping = false;
let swipeStartTime = 0;

function setupEventListeners() {
    // Touch events with real-time tracking
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        swipeStartTime = Date.now();
        isSwiping = true;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (isSwiping) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
        }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (isSwiping) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
            isSwiping = false;
        }
    }, { passive: true });

    // Mouse events for desktop - improved drag support
    let mouseDownX = 0;
    let mouseDownY = 0;
    let isMouseDown = false;
    let mouseMoveX = 0;
    let mouseMoveY = 0;

    document.addEventListener('mousedown', (e) => {
        mouseDownX = e.clientX;
        mouseDownY = e.clientY;
        mouseMoveX = e.clientX;
        mouseMoveY = e.clientY;
        isMouseDown = true;
        swipeStartTime = Date.now();
    });

    document.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            mouseMoveX = e.clientX;
            mouseMoveY = e.clientY;
        }
    }, { passive: true });

    document.addEventListener('mouseup', (e) => {
        if (isMouseDown) {
            touchEndX = e.clientX;
            touchEndY = e.clientY;
            touchStartX = mouseDownX;
            touchStartY = mouseDownY;
            handleSwipe();
            isMouseDown = false;
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        }
    });

    // Navigation dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            scrollToSection(index);
        });
    });

    // Wheel event for smooth scrolling - immediate response
    let wheelTimeout;
    let lastWheelTime = 0;
    document.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (now - lastWheelTime > 300) {
            lastWheelTime = now;
            if (e.deltaY > 30 && currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1);
            } else if (e.deltaY < -30 && currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        }
    }, { passive: true });
}

// Handle swipe gesture with momentum
function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const swipeTime = Date.now() - swipeStartTime;
    const minSwipeDistance = 30; // Reduced for more responsive feel
    const minSwipeVelocity = 0.2; // pixels per millisecond (reduced for better sensitivity)

    // Calculate velocity
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = swipeTime > 0 ? distance / swipeTime : 0;

    // Determine if horizontal or vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance || velocity > minSwipeVelocity) {
            if (deltaX > 0) {
                // Swipe right to left (finger moves right) - go to previous section
                if (currentSection > 0) {
                    scrollToSection(currentSection - 1);
                }
            } else if (deltaX < 0) {
                // Swipe left to right (finger moves left) - go to next section
                if (currentSection < totalSections - 1) {
                    scrollToSection(currentSection + 1);
                }
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance || velocity > minSwipeVelocity) {
            if (deltaY > 0) {
                // Swipe down - go to previous section
                if (currentSection > 0) {
                    scrollToSection(currentSection - 1);
                }
            } else if (deltaY < 0) {
                // Swipe up - go to next section
                if (currentSection < totalSections - 1) {
                    scrollToSection(currentSection + 1);
                }
            }
        }
    }
}

// Background Particles Animation
function createBackgroundParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;
    
    const particleCount = 200; // Increased number of particles
    
    // Create initial particles
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            createParticle(container);
        }, i * 50); // Stagger creation for smoother start
    }
    
    // Continuously add new particles more frequently
    setInterval(() => {
        createParticle(container);
        // Add multiple particles at once
        setTimeout(() => createParticle(container), 300);
        setTimeout(() => createParticle(container), 600);
    }, 800); // More frequent spawning
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random particle type - more variety
    const types = ['particle-small', 'particle-medium', 'particle-large', 'particle-glow'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    particle.classList.add(randomType);
    
    // Random starting position
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.bottom = '-10px';
    
    // Faster animation duration (10-20 seconds) for more movement
    const duration = Math.random() * 10 + 10;
    particle.style.animationDuration = `${duration}s`;
    
    // Random delay
    particle.style.animationDelay = `${Math.random() * 1}s`;
    
    // Random horizontal drift
    const driftAmount = (Math.random() - 0.5) * 300;
    particle.style.setProperty('--drift', `${driftAmount}px`);
    
    // Add custom animation for variety
    const animations = ['particleFloat', 'particleDrift', 'particleFloat2', 'particleFloat3'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    particle.style.animationName = randomAnimation;
    
    // Random opacity for depth
    particle.style.opacity = Math.random() * 0.5 + 0.3;
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, (duration + 2) * 1000);
}

// Water Droplet Effects (iOS Liquidity)
function createWaterDroplets() {
    const container = document.getElementById('waterDroplets');
    const dropletCount = 15;

    for (let i = 0; i < dropletCount; i++) {
        setTimeout(() => {
            createDroplet(container);
        }, i * 500);
    }

    // Continuously create new droplets
    setInterval(() => {
        createDroplet(container);
    }, 3000);
}

function createDroplet(container) {
    const droplet = document.createElement('div');
    droplet.className = 'droplet';
    
    // Random size between 30px and 100px
    const size = Math.random() * 70 + 30;
    droplet.style.width = `${size}px`;
    droplet.style.height = `${size}px`;
    
    // Random horizontal position
    droplet.style.left = `${Math.random() * 100}%`;
    
    // Random animation duration
    const duration = Math.random() * 4 + 6; // 6-10 seconds
    droplet.style.animationDuration = `${duration}s`;
    
    // Random delay
    droplet.style.animationDelay = `${Math.random() * 2}s`;
    
    container.appendChild(droplet);
    
    // Remove droplet after animation
    setTimeout(() => {
        if (droplet.parentNode) {
            droplet.parentNode.removeChild(droplet);
        }
    }, (duration + 2) * 1000);
}

// Form submission
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // Show loading state
            const submitButton = contactForm.querySelector('.btn-submit');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Allow Formspree to handle the submission naturally
            // The form will submit to Formspree and show their success message
        });
    }
    
    init();
});

// Smooth scroll to section function (for buttons)
window.scrollToSection = scrollToSection;

// Interactive Profile Image with Water Effects
function setupInteractiveImage() {
    const imageContainer = document.querySelector('.hero-image-container');
    const liquidEffect = document.querySelector('.liquid-effect');
    const profileImage = document.getElementById('profileImage');
    
    if (!imageContainer || !liquidEffect) return;
    
    // Mouse move tracking for liquid effect
    imageContainer.addEventListener('mousemove', (e) => {
        const rect = imageContainer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        liquidEffect.style.setProperty('--mouse-x', `${x}%`);
        liquidEffect.style.setProperty('--mouse-y', `${y}%`);
        liquidEffect.style.opacity = '1';
    });
    
    imageContainer.addEventListener('mouseleave', () => {
        liquidEffect.style.opacity = '0';
    });
    
    // Touch support for mobile
    imageContainer.addEventListener('touchmove', (e) => {
        const rect = imageContainer.getBoundingClientRect();
        const touch = e.touches[0];
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        
        liquidEffect.style.setProperty('--mouse-x', `${x}%`);
        liquidEffect.style.setProperty('--mouse-y', `${y}%`);
        liquidEffect.style.opacity = '1';
    }, { passive: true });
    
    imageContainer.addEventListener('touchend', () => {
        liquidEffect.style.opacity = '0';
    });
    
    // Click effect - create water splash
    imageContainer.addEventListener('click', (e) => {
        createWaterSplash(e, imageContainer);
    });
}

// Create water splash effect on click
function createWaterSplash(e, container) {
    const splash = document.createElement('div');
    splash.className = 'water-splash';
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    splash.style.left = `${x}px`;
    splash.style.top = `${y}px`;
    
    container.appendChild(splash);
    
    setTimeout(() => {
        splash.remove();
    }, 1000);
}

