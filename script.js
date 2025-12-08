// Swipe Animation and Navigation
let currentSection = 0;
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const totalSections = sections.length;

// Initialize
function init() {
    showSection(currentSection);
    createWaterDroplets();
    createBackgroundParticles();
    setupEventListeners();
    hideSwipeInstruction();
    setupInteractiveImage();
    setupTypewriterAnimation();
    setupSectionTitlesTypewriter();
    setupAudioControl();
    setupLogoInteraction();
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
        
        // Update navigation links
        navLinks.forEach((link, i) => {
            link.classList.toggle('active', i === index);
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

    // Keyboard navigation - left and right arrows only
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1);
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        }
    });

    // Navigation links (already have onclick handlers in HTML, but adding for consistency)
    navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSection(index);
        });
    });

    // Wheel event for horizontal scrolling - immediate response
    let wheelTimeout;
    let lastWheelTime = 0;
    document.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (now - lastWheelTime > 300) {
            lastWheelTime = now;
            // Use deltaX for horizontal scrolling
            if (e.deltaX > 30 && currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1);
            } else if (e.deltaX < -30 && currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        }
    }, { passive: true });
}

// Handle swipe gesture with momentum - horizontal only
function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const swipeTime = Date.now() - swipeStartTime;
    const minSwipeDistance = 30; // Reduced for more responsive feel
    const minSwipeVelocity = 0.2; // pixels per millisecond (reduced for better sensitivity)

    // Calculate velocity for horizontal swipe only
    const distance = Math.abs(deltaX);
    const velocity = swipeTime > 0 ? distance / swipeTime : 0;

    // Only handle horizontal swipes
    if (Math.abs(deltaX) > minSwipeDistance || velocity > minSwipeVelocity) {
        if (deltaX > 0) {
            // Swipe right (finger moves right) - go to previous section
            if (currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        } else if (deltaX < 0) {
            // Swipe left (finger moves left) - go to next section
            if (currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1);
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

// Interactive Profile Image with Water Effects (supports multiple images)
function setupInteractiveImage() {
    const containers = document.querySelectorAll('.interactive-image');
    containers.forEach((imageContainer) => {
        const liquidEffect = imageContainer.querySelector('.liquid-effect');
        if (!liquidEffect) return;
        
        const updateEffect = (x, y) => {
            liquidEffect.style.setProperty('--mouse-x', `${x}%`);
            liquidEffect.style.setProperty('--mouse-y', `${y}%`);
            liquidEffect.style.opacity = '1';
        };
        
        // Mouse move tracking for liquid effect
        imageContainer.addEventListener('mousemove', (e) => {
            const rect = imageContainer.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            updateEffect(x, y);
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
            updateEffect(x, y);
        }, { passive: true });
        
        imageContainer.addEventListener('touchend', () => {
            liquidEffect.style.opacity = '0';
        });
        
        // Click effect - create water splash
        imageContainer.addEventListener('click', (e) => {
            createWaterSplash(e, imageContainer);
        });
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

// Typewriter Animation for Hero Text , yws
function setupTypewriterAnimation() {
    const animatedTextElement = document.getElementById('animated-text');
    if (!animatedTextElement) return;
    
    const fullText = "I am a creative Developer & Designer";
    let currentIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100; // milliseconds per character
    let deletingSpeed = 50; // faster when deleting
    let pauseTime = 2000; // pause before deleting
    
    function typeWriter() {
        if (!isDeleting && currentIndex < fullText.length) {
            // Typing forward
            animatedTextElement.textContent = fullText.substring(0, currentIndex + 1);
            currentIndex++;
            setTimeout(typeWriter, typingSpeed);
        } else if (!isDeleting && currentIndex === fullText.length) {
            // Finished typing, pause then start deleting
            setTimeout(() => {
                isDeleting = true;
                typeWriter();
            }, pauseTime);
        } else if (isDeleting && currentIndex > 0) {
            // Deleting backward
            currentIndex--;
            animatedTextElement.textContent = fullText.substring(0, currentIndex);
            setTimeout(typeWriter, deletingSpeed);
        } else if (isDeleting && currentIndex === 0) {
            // Finished deleting, start typing again
            isDeleting = false;
            setTimeout(typeWriter, 500); // Small pause before restarting
        }
    }
    
    // Start the animation
    typeWriter();
}

// Typewriter animation for all section titles
function setupSectionTitlesTypewriter() {
    const titles = document.querySelectorAll('.section-title');
    titles.forEach((title) => {
        const fullText = title.textContent.trim();
        let currentIndex = 0;
        let isDeleting = false;
        const typingSpeed = 80;
        const deletingSpeed = 50;
        const pauseTime = 1200;
        
        const typeLoop = () => {
            if (!isDeleting && currentIndex <= fullText.length) {
                title.textContent = fullText.substring(0, currentIndex);
                currentIndex++;
                setTimeout(typeLoop, typingSpeed);
            } else if (!isDeleting && currentIndex > fullText.length) {
                setTimeout(() => {
                    isDeleting = true;
                    typeLoop();
                }, pauseTime);
            } else if (isDeleting && currentIndex >= 0) {
                title.textContent = fullText.substring(0, currentIndex);
                currentIndex--;
                setTimeout(typeLoop, deletingSpeed);
            } else if (isDeleting && currentIndex < 0) {
                isDeleting = false;
                currentIndex = 0;
                setTimeout(typeLoop, 400);
            }
        };
        
        typeLoop();
    });
}

// Background Audio Control
function setupAudioControl() {
    const audio = document.getElementById('background-audio');
    const audioToggle = document.getElementById('audio-toggle');
    const audioIcon = audioToggle.querySelector('.audio-icon');
    
    if (!audio || !audioToggle) return;
    
    let isPlaying = false;
    
    // Set initial volume (30% for background music)
    audio.volume = 0.3;
    
    audioToggle.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            audioIcon.textContent = '🔇';
            isPlaying = false;
        } else {
            // Try to play - may require user interaction due to browser policies
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        audioIcon.textContent = '🔊';
                        isPlaying = true;
                    })
                    .catch(error => {
                        // Auto-play was prevented, show muted icon
                        console.log('Audio play prevented:', error);
                        audioIcon.textContent = '🔇';
                    });
            }
        }
    });
    
    // Update icon when audio ends or is paused
    audio.addEventListener('pause', () => {
        audioIcon.textContent = '🔇';
        isPlaying = false;
    });
    
    audio.addEventListener('play', () => {
        audioIcon.textContent = '🔊';
        isPlaying = true;
    });
}

// Logo Interaction
function setupLogoInteraction() {
    const logo = document.querySelector('.nav-logo');
    if (!logo) return;
    
    // Make logo clickable - scroll to home
    logo.addEventListener('click', () => {
        scrollToSection(0);
    });
    
    // Add ripple effect on click
    logo.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('logo-ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

