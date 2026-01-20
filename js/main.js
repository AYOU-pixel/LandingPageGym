// Conversion-Optimized JavaScript for IRONCLAD Fitness

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        once: true,
        offset: 100,
        easing: 'ease-out-cubic'
    });

    // DOM Elements
    const nav = document.getElementById('navbar');
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const whatsappModal = document.getElementById('whatsapp-modal');
    const closeModal = document.getElementById('close-modal');
    const stickyWhatsappBtn = document.querySelector('#whatsapp-sticky .whatsapp-cta');
    
    let isMenuOpen = false;
    let scrollTimer = null;

    // WhatsApp Pre-filled Messages Configuration
    const whatsappMessages = {
        'freeTrial': "Hi IRONCLAD! I'd like to book a free trial session. Can you help me choose the right plan?",
        'transformation': "I'm interested in the 90-day transformation program. Can you tell me more about how it works for busy professionals?",
        'pricing': "I have questions about pricing. Can we chat about which plan would be best for my goals?",
        'coach': "I'd like to speak with a coach about getting started. When's the best time to connect?"
    };

    // Navbar Scroll Effect
    window.addEventListener('scroll', handleNavbarScroll);

    function handleNavbarScroll() {
        if (scrollTimer) return;
        
        scrollTimer = setTimeout(() => {
            if (window.scrollY > 100) {
                nav.classList.add('shadow-lg', 'bg-black/95');
                nav.classList.remove('bg-black/90');
            } else {
                nav.classList.remove('shadow-lg', 'bg-black/95');
                nav.classList.add('bg-black/90');
            }
            scrollTimer = null;
        }, 10);
    }

    // Mobile Menu Toggle
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            mobileMenu.classList.remove('menu-closed');
            mobileMenu.classList.add('menu-open');
            menuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            document.body.style.overflow = 'hidden';
            trackEvent('Mobile Menu', 'Opened');
        } else {
            mobileMenu.classList.remove('menu-open');
            mobileMenu.classList.add('menu-closed');
            menuBtn.innerHTML = '<i class="fa-solid fa-bars-staggered"></i>';
            document.body.style.overflow = '';
            trackEvent('Mobile Menu', 'Closed');
        }
    }

    menuBtn.addEventListener('click', toggleMenu);

    // Close mobile menu when clicking links
    mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu();
            
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 300);
                }
            }
            
            trackEvent('Navigation', `Clicked: ${targetId}`);
        });
    });

    // WhatsApp Modal
    function showWhatsAppModal(purpose = 'freeTrial') {
        whatsappModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Update WhatsApp links with appropriate pre-filled message
        const whatsappLinks = whatsappModal.querySelectorAll('a[href*="whatsapp"]');
        whatsappLinks.forEach(link => {
            const currentHref = link.getAttribute('href');
            const baseUrl = currentHref.split('?')[0];
            const newHref = `${baseUrl}?text=${encodeURIComponent(whatsappMessages[purpose])}`;
            link.setAttribute('href', newHref);
        });
        
        trackEvent('WhatsApp Modal', `Opened: ${purpose}`);
    }

    closeModal.addEventListener('click', () => {
        whatsappModal.classList.add('hidden');
        document.body.style.overflow = '';
        trackEvent('WhatsApp Modal', 'Closed');
    });

    // Close modal when clicking outside
    whatsappModal.addEventListener('click', (e) => {
        if (e.target === whatsappModal) {
            whatsappModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    // Enhanced WhatsApp CTA Click Handler
    document.querySelectorAll('a[href*="whatsapp"]').forEach(link => {
        link.addEventListener('click', (e) => {
            // Don't prevent default - let it open WhatsApp
            trackEvent('WhatsApp CTA', 'Clicked', {
                location: link.closest('section')?.id || 'unknown',
                text: link.textContent.trim()
            });
            
            // For desktop, open in new tab
            if (window.innerWidth > 768) {
                e.preventDefault();
                window.open(link.href, '_blank');
            }
        });
    });

    // Scroll-based WhatsApp button behavior
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Show/hide sticky button based on scroll position
        if (scrollPosition > windowHeight * 0.5 && scrollPosition < documentHeight - windowHeight * 1.5) {
            stickyWhatsappBtn.style.opacity = '1';
            stickyWhatsappBtn.style.transform = 'scale(1)';
        } else {
            stickyWhatsappBtn.style.opacity = '0.8';
            stickyWhatsappBtn.style.transform = 'scale(0.95)';
        }
        
        // Track scroll depth
        trackScrollDepth(scrollPosition, documentHeight);
    });

    // Scroll Depth Tracking
    function trackScrollDepth(scrollPos, docHeight) {
        const depth = Math.floor((scrollPos / docHeight) * 100);
        const milestones = [25, 50, 75, 90, 100];
        
        milestones.forEach(milestone => {
            if (depth >= milestone && depth < milestone + 1) {
                trackEvent('Scroll Depth', `${milestone}%`);
            }
        });
    }

    // Time on Page Tracking
    let timeStart = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.floor((Date.now() - timeStart) / 1000);
        trackEvent('Time on Page', `${timeSpent} seconds`);
    });

    // Exit Intent Detection for WhatsApp Modal
    document.addEventListener('mouseout', (e) => {
        if (!e.toElement && !e.relatedTarget) {
            if (!localStorage.getItem('exitIntentShown')) {
                setTimeout(() => {
                    showWhatsAppModal('freeTrial');
                    localStorage.setItem('exitIntentShown', 'true');
                }, 500);
            }
        }
    });

    // Plan Selection Enhancement
    document.querySelectorAll('.plan-select-btn, [href*="whatsapp"]').forEach(button => {
        button.addEventListener('click', function(e) {
            // Add loading state for WhatsApp buttons
            if (this.href && this.href.includes('whatsapp')) {
                const originalHTML = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Opening WhatsApp...';
                
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                }, 2000);
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                history.pushState(null, null, href);
            }
        });
    });

    // Enhanced WhatsApp button copy rotation (for A/B testing)
    function rotateWhatsAppCopy() {
        const copies = [
            "Chat with Coach",
            "Book Free Trial",
            "Get Started",
            "Ask Questions"
        ];
        
        const button = document.querySelector('#whatsapp-sticky .whatsapp-cta span');
        if (button) {
            const randomCopy = copies[Math.floor(Math.random() * copies.length)];
            button.textContent = randomCopy;
        }
    }

    // Rotate copy every 10 seconds (for testing)
    // setInterval(rotateWhatsAppCopy, 10000);

    // Analytics/Tracking Function
    function trackEvent(category, action, data = {}) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                ...data
            });
        }
        
        // Hotjar
        if (typeof hj !== 'undefined') {
            hj('event', `${category}_${action}`);
        }
        
        // Console log for debugging
        console.log(`[Tracking] ${category}: ${action}`, data);
    }

    // Initialize
    handleNavbarScroll();
    
    // Auto-open WhatsApp modal after 30 seconds if no interaction
    setTimeout(() => {
        if (!localStorage.getItem('whatsappModalShown')) {
            const scrollPosition = window.scrollY;
            if (scrollPosition < window.innerHeight * 0.5) {
                showWhatsAppModal('freeTrial');
                localStorage.setItem('whatsappModalShown', 'true');
            }
        }
    }, 30000);

    // Add class for touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.body.classList.add('touch-device');
    }
});