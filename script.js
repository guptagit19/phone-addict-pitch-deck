// ========== PITCH DECK NAVIGATION SYSTEM ==========

(function () {
    'use strict';

    const slides = document.querySelectorAll('.slide');
    const navDots = document.querySelectorAll('.nav-dot');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentSlideEl = document.getElementById('current-slide');
    const totalSlidesEl = document.getElementById('total-slides');

    let currentSlide = 0;
    let isTransitioning = false;
    const totalSlides = slides.length;

    // Init
    totalSlidesEl.textContent = totalSlides;
    updateSlideCounter();
    updateNavButtons();

    // ========== CORE NAVIGATION ==========

    function goToSlide(index, direction = 'next') {
        if (isTransitioning || index === currentSlide || index < 0 || index >= totalSlides) return;
        isTransitioning = true;

        const prevSlide = slides[currentSlide];
        const nextSlide = slides[index];

        // Exit animation
        prevSlide.classList.remove('active');
        if (direction === 'next') {
            prevSlide.classList.add('exit-left');
        }

        // Enter animation
        nextSlide.style.transform = direction === 'next' ? 'translateX(60px)' : 'translateX(-60px)';
        nextSlide.classList.add('active');

        // Force reflow
        void nextSlide.offsetWidth;

        nextSlide.style.transform = '';

        // Clean up after transition
        setTimeout(() => {
            prevSlide.classList.remove('exit-left');
            currentSlide = index;
            updateSlideCounter();
            updateNavDots();
            updateNavButtons();
            isTransitioning = false;
        }, 600);
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1, 'next');
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1, 'prev');
        }
    }

    // ========== UI UPDATES ==========

    function updateSlideCounter() {
        currentSlideEl.textContent = currentSlide + 1;
    }

    function updateNavDots() {
        navDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function updateNavButtons() {
        prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';
        nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';
        nextBtn.style.pointerEvents = currentSlide === totalSlides - 1 ? 'none' : 'auto';
    }

    // ========== EVENT LISTENERS ==========

    // Arrow buttons
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Nav dots
    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetIndex = parseInt(dot.dataset.slide);
            const direction = targetIndex > currentSlide ? 'next' : 'prev';
            goToSlide(targetIndex, direction);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0, 'prev');
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1, 'next');
                break;
        }
    });

    // Mouse wheel navigation (debounced)
    let wheelTimeout = null;
    document.addEventListener('wheel', (e) => {
        if (wheelTimeout) return;
        wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 800);

        if (e.deltaY > 30) {
            nextSlide();
        } else if (e.deltaY < -30) {
            prevSlide();
        }
    }, { passive: true });

    // Touch / Swipe navigation
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Only handle horizontal swipes that are more horizontal than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }, { passive: true });

    // ========== FUND BAR ANIMATION ==========
    // Re-trigger fund bar animation when slide becomes active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const slide = mutation.target;
                if (slide.classList.contains('active') && slide.classList.contains('slide-ask')) {
                    const fills = slide.querySelectorAll('.fund-fill');
                    fills.forEach(fill => {
                        fill.style.animation = 'none';
                        void fill.offsetWidth;
                        fill.style.animation = '';
                    });
                }
            }
        });
    });

    slides.forEach(slide => {
        observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
    });

    // ========== TOOLTIP ON NAV DOTS ==========
    navDots.forEach(dot => {
        dot.addEventListener('mouseenter', (e) => {
            const title = dot.getAttribute('title');
            if (title) {
                dot.setAttribute('data-tooltip', title);
            }
        });
    });

    console.log('🚀 PhoneAddict Pitch Deck initialized — ' + totalSlides + ' slides ready!');
})();
