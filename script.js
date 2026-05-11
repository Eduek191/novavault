/* ============================================
   NEXUS STORE — Main JavaScript
   ============================================ */

'use strict';

// ============================================
// Scroll Progress Bar
// ============================================
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ============================================
// Navbar: scroll effects + active links
// ============================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  if (!navbar) return;

  // Scrolled state
  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link on scroll (index page)
    if (sections.length === 0) return;
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.includes('#') && href.includes(current)) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ============================================
// Mobile Hamburger Menu
// ============================================
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      mobileMenu.classList.add('open');
      mobileMenu.style.display = 'flex';
      // Trigger reflow for transition
      requestAnimationFrame(() => {
        mobileMenu.style.opacity = '1';
        mobileMenu.style.transform = 'translateY(0)';
      });
    } else {
      mobileMenu.style.opacity = '0';
      mobileMenu.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (!isOpen) {
          mobileMenu.classList.remove('open');
          mobileMenu.style.display = 'none';
        }
      }, 300);
    }
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggleMenu();
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      toggleMenu();
    }
  });
}

// ============================================
// Smooth Scroll for nav links
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ============================================
// Intersection Observer: Fade-in Animations
// ============================================
function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ============================================
// FAQ Accordion
// ============================================
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          const otherQ = other.querySelector('.faq-question');
          if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle this
      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', (!isOpen).toString());
    });
  });
}

// ============================================
// Testimonial Carousel (mobile)
// ============================================
function initCarousel() {
  const track = document.getElementById('testimonials-track');
  const dots = document.querySelectorAll('.carousel-dot');
  const cards = document.querySelectorAll('.testimonial-card[data-index]');
  if (!track || !dots.length || !cards.length) return;

  let currentSlide = 0;
  let autoTimer = null;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function showSlide(index) {
    if (!isMobile()) return;
    currentSlide = (index + cards.length) % cards.length;

    cards.forEach((card, i) => {
      card.style.display = i === currentSlide ? 'block' : 'none';
      card.classList.toggle('carousel-active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      if (isMobile()) showSlide(currentSlide + 1);
    }, 4000);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  // Dot click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      stopAuto();
      startAuto();
    });
  });

  // Swipe support on mobile
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      showSlide(currentSlide + (diff > 0 ? 1 : -1));
    }
  }, { passive: true });

  // Initialize
  function handleResize() {
    if (isMobile()) {
      showSlide(currentSlide);
      startAuto();
    } else {
      stopAuto();
      cards.forEach(card => {
        card.style.display = '';
      });
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();
}

// ============================================
// Toast Notification
// ============================================
function showToast(productName) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.innerHTML = '<span class="toast-icon">✓</span> Added to cart! Redirecting to checkout...';
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Buy Now buttons
function initBuyButtons() {
  document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.getAttribute('data-product') || 'Product';
      showToast(product);
    });
  });

  // Product detail buy button
  const detailBuy = document.getElementById('detail-buy-btn');
  if (detailBuy) {
    detailBuy.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('AI Prompt Mastery Pack');
    });
  }
}

// ============================================
// Wishlist Toggle
// ============================================
function initWishlist() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isWishlisted = btn.classList.toggle('wishlisted');
      btn.textContent = isWishlisted ? '♥' : '♡';
      btn.setAttribute('aria-label', isWishlisted ? 'Remove from wishlist' : 'Add to wishlist');
    });
  });
}

// ============================================
// Newsletter Form
// ============================================
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    if (!emailInput) return;

    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      emailInput.style.borderColor = 'rgba(236,72,153,0.7)';
      emailInput.focus();
      setTimeout(() => {
        emailInput.style.borderColor = '';
      }, 2000);
      return;
    }

    // Show success
    form.style.display = 'none';
    const success = document.getElementById('newsletter-success');
    if (success) {
      success.style.display = 'flex';
    }
  });
}

// ============================================
// Contact Form
// ============================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';

    if (submitBtn) {
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      const successMsg = document.getElementById('contact-success');
      if (successMsg) {
        form.style.display = 'none';
        successMsg.style.display = 'block';
      } else {
        if (submitBtn) {
          submitBtn.textContent = '✓ Message Sent!';
          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            form.reset();
          }, 3000);
        }
      }
    }, 1200);
  });
}

// ============================================
// Counter Animation (hero trust badges)
// ============================================
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 1800;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(eased * target);

          if (target >= 1000) {
            el.textContent = (value >= 1000)
              ? (value / 1000).toFixed(value % 1000 === 0 ? 0 : 0) + 'K'
              : value;
          } else {
            el.textContent = value;
          }

          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ============================================
// Category card click (feedback)
// ============================================
function initCategories() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const section = document.getElementById('products');
      if (section) {
        const navHeight = 72;
        const top = section.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initFadeIn();
  initFAQ();
  initCarousel();
  initBuyButtons();
  initWishlist();
  initNewsletter();
  initContactForm();
  initCounters();
  initCategories();
});

// Expose showToast globally for inline onclick usage
window.showToast = showToast;
