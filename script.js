// ============================================
// STORYBOOK PARADISE - INTERACTIVE FEATURES
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    setupScrollEffects();
    setupInteractiveCards();
    initializeCarousel();
});

// Initialize entrance animations
function initializeAnimations() {
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

    // Observe story cards and category cards
    document.querySelectorAll('.story-card, .category-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Setup scroll effects
function setupScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Setup interactive card effects
function setupInteractiveCards() {
    const cards = document.querySelectorAll('.story-card, .category-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });

        card.addEventListener('click', function() {
            // Add subtle feedback when card is clicked
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // If it's a story card with a URL, change the iframe and scroll to viewer
            if (this.classList.contains('story-card') && this.dataset.url) {
                const iframe = document.querySelector('#bookViewer iframe');
                const viewerTitle = document.querySelector('#bookViewer h2');
                if (iframe) {
                    iframe.src = this.dataset.url;
                    iframe.title = this.querySelector('h3').textContent;
                }
                if (viewerTitle) {
                    viewerTitle.textContent = '📖 Read: ' + this.querySelector('h3').textContent;
                }
                document.getElementById('bookViewer').scrollIntoView({behavior: 'smooth'});
            }
        });
    });
}

// Smooth scroll with offset for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open elements if needed
        console.log('Escape key pressed');
    }
});

// ============================================
// CAROUSEL FUNCTIONALITY
// ============================================

let currentSlide = 0;
let carouselItems = [];
let startX = 0;
let endX = 0;
let isDragging = false;

function initializeCarousel() {
    const carouselInner = document.getElementById('carouselInner');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    const carouselDotsContainer = document.getElementById('carouselDots');

    if (!carouselInner) return;

    carouselItems = document.querySelectorAll('.carousel-item');
    const itemCount = carouselItems.length;

    // Create carousel dots
    for (let i = 0; i < itemCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        carouselDotsContainer.appendChild(dot);
    }

    // Navigation button listeners
    carouselPrev?.addEventListener('click', () => prevSlide());
    carouselNext?.addEventListener('click', () => nextSlide());

    // Touch/swipe support
    carouselInner.addEventListener('touchstart', handleTouchStart, false);
    carouselInner.addEventListener('touchend', handleTouchEnd, false);

    // Mouse drag support
    carouselInner.addEventListener('mousedown', handleMouseDown, false);
    carouselInner.addEventListener('mousemove', handleMouseMove, false);
    carouselInner.addEventListener('mouseup', handleMouseUp, false);
    carouselInner.addEventListener('mouseleave', handleMouseUp, false);

    // Carousel item click handlers
    carouselItems.forEach(item => {
        const card = item.querySelector('.carousel-card');
        if (card) {
            card.addEventListener('click', function(e) {
                e.stopPropagation();
                const dataUrl = item.dataset.url;
                if (dataUrl) {
                    const iframe = document.querySelector('#bookViewer iframe');
                    const viewerTitle = document.querySelector('#bookViewer h2');
                    if (iframe) {
                        iframe.src = dataUrl;
                        iframe.title = item.querySelector('h3').textContent;
                    }
                    if (viewerTitle) {
                        viewerTitle.textContent = '📖 Read: ' + item.querySelector('h3').textContent;
                    }
                    document.getElementById('bookViewer').scrollIntoView({behavior: 'smooth'});
                }
            });
        }
    });

    updateCarousel();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % carouselItems.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const carouselInner = document.getElementById('carouselInner');
    if (!carouselInner) return;

    // Update carousel position
    const translateX = -currentSlide * 100;
    carouselInner.style.transform = `translateX(${translateX}%)`;

    // Update dots
    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
}

function handleTouchEnd(e) {
    endX = e.changedTouches[0].clientX;
    isDragging = false;
    handleSwipe();
}

function handleMouseDown(e) {
    startX = e.clientX;
    isDragging = true;
    e.preventDefault();
}

function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
}

function handleMouseUp(e) {
    endX = e.clientX;
    isDragging = false;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left, go to next
            nextSlide();
        } else {
            // Swiped right, go to previous
            prevSlide();
        }
    }
}

// Log page load info
console.log('🎉 Welcome to Storybook Paradise!');
console.log('📚 This website is dedicated to children\'s stories and adventures.');
console.log('✨ Enjoy exploring our collection of magical tales!');
