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

    function goToSlide(index, direction) {
        if (isTransitioning || index === currentSlide || index < 0 || index >= totalSlides) return;
        isTransitioning = true;

        direction = direction || (index > currentSlide ? 'next' : 'prev');

        const prevSlideEl = slides[currentSlide];
        const nextSlideEl = slides[index];

        // Reset scroll position for new slide
        const innerEl = nextSlideEl.querySelector('.slide-inner');
        if (innerEl) innerEl.scrollTop = 0;

        // Exit animation
        prevSlideEl.classList.remove('active');
        if (direction === 'next') {
            prevSlideEl.classList.add('exit-left');
        }

        // Enter animation
        nextSlideEl.style.transform = direction === 'next' ? 'translateX(50px)' : 'translateX(-50px)';
        nextSlideEl.classList.add('active');

        // Force reflow
        void nextSlideEl.offsetWidth;
        nextSlideEl.style.transform = '';

        // Clean up after transition
        setTimeout(function () {
            prevSlideEl.classList.remove('exit-left');
            prevSlideEl.style.transform = '';
            currentSlide = index;
            updateSlideCounter();
            updateNavDots();
            updateNavButtons();
            isTransitioning = false;
        }, 500);
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
        navDots.forEach(function (dot, i) {
            if (i === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
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
    nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
    });

    prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
    });

    // Nav dots
    navDots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var targetIndex = parseInt(dot.dataset.slide);
            goToSlide(targetIndex);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
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

    // Mouse wheel — only on body/slide level, not inside scrollable content
    var wheelTimeout = null;

    document.addEventListener('wheel', function (e) {
        // Don't intercept scroll if user is scrolling inside slide content
        var activeSlide = slides[currentSlide];
        var inner = activeSlide ? activeSlide.querySelector('.slide-inner') : null;

        if (inner) {
            var isScrollable = inner.scrollHeight > inner.clientHeight;
            if (isScrollable) {
                var atTop = inner.scrollTop <= 2;
                var atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2;

                // Only navigate if we're at the edge of scroll
                if (e.deltaY > 0 && !atBottom) return;
                if (e.deltaY < 0 && !atTop) return;
            }
        }

        if (wheelTimeout) return;
        wheelTimeout = setTimeout(function () { wheelTimeout = null; }, 1000);

        if (e.deltaY > 20) {
            nextSlide();
        } else if (e.deltaY < -20) {
            prevSlide();
        }
    }, { passive: true });

    // Touch / Swipe navigation
    var touchStartX = 0;
    var touchStartY = 0;
    var touchStartTime = 0;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        var touchEndX = e.changedTouches[0].clientX;
        var touchEndY = e.changedTouches[0].clientY;
        var deltaX = touchEndX - touchStartX;
        var deltaY = touchEndY - touchStartY;
        var elapsed = Date.now() - touchStartTime;

        // Only horizontal swipes that are quick and more horizontal than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 60 && elapsed < 500) {
            if (deltaX < 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }, { passive: true });

    // ========== FUND BAR RE-ANIMATION ==========
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                var slide = mutation.target;
                if (slide.classList.contains('active') && slide.classList.contains('slide-ask')) {
                    var fills = slide.querySelectorAll('.fund-fill');
                    fills.forEach(function (fill) {
                        fill.style.animation = 'none';
                        void fill.offsetWidth;
                        fill.style.animation = '';
                    });
                }
            }
        });
    });

    slides.forEach(function (slide) {
        observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
    });

    console.log('🚀 PhoneAddict Pitch Deck initialized — ' + totalSlides + ' slides');
})();
