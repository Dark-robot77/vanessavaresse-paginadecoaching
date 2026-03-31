/* ============================================================
   VANESSA VARESSE — main.js
   v2 — with lightbox, video modal, dynamic effects
   ============================================================ */

/* ===== NAVBAR MOBILE TOGGLE ===== */
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ===== ACTIVE NAV LINK ===== */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ===== NAVBAR SCROLL EFFECT ===== */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ===== SCROLL ANIMATIONS (Intersection Observer) ===== */
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.fade-up, .scale-in, .slide-left, .slide-right, .stagger-children, .reveal-line').forEach(el => {
  fadeObserver.observe(el);
});

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const prefix   = el.dataset.prefix || '';
  const duration = 1800;
  const step     = Math.ceil(target / (duration / 16));
  let current    = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = prefix + current.toLocaleString('es') + suffix;
  }, 16);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.stat-counter').forEach(el => statObserver.observe(el));

/* ===== HERO SCROLL INDICATOR ===== */
const heroScroll = document.querySelector('.hero-scroll');
if (heroScroll) {
  heroScroll.style.cursor = 'pointer';
  heroScroll.addEventListener('click', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
      const next = hero.nextElementSibling;
      if (next) next.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/* ============================================================
   LIGHTBOX / IMAGE POPUP
   ============================================================ */
(function initLightbox() {
  const items = document.querySelectorAll('[data-lightbox]');
  if (!items.length) return;

  // Group images by gallery name
  const galleries = {};
  items.forEach(el => {
    const group = el.dataset.lightbox || 'default';
    if (!galleries[group]) galleries[group] = [];
    const img = el.querySelector('img');
    if (img) galleries[group].push({ src: img.src, alt: img.alt, el });
  });

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Cerrar"><i class="fas fa-times"></i></button>
    <button class="lightbox-nav lightbox-prev" aria-label="Anterior"><i class="fas fa-chevron-left"></i></button>
    <button class="lightbox-nav lightbox-next" aria-label="Siguiente"><i class="fas fa-chevron-right"></i></button>
    <img src="" alt="" />
    <div class="lightbox-counter"></div>
  `;
  document.body.appendChild(overlay);

  const lbImg     = overlay.querySelector('img');
  const lbClose   = overlay.querySelector('.lightbox-close');
  const lbPrev    = overlay.querySelector('.lightbox-prev');
  const lbNext    = overlay.querySelector('.lightbox-next');
  const lbCounter = overlay.querySelector('.lightbox-counter');

  let currentGroup = [];
  let currentIndex = 0;

  function openLightbox(group, index) {
    currentGroup = galleries[group];
    currentIndex = index;
    showImage();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showImage() {
    const item = currentGroup[currentIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCounter.textContent = `${currentIndex + 1} / ${currentGroup.length}`;
    lbPrev.style.display = currentGroup.length > 1 ? 'flex' : 'none';
    lbNext.style.display = currentGroup.length > 1 ? 'flex' : 'none';
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % currentGroup.length;
    showImage();
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
    showImage();
  }

  // Attach click to each gallery item
  items.forEach(el => {
    el.addEventListener('click', () => {
      const group = el.dataset.lightbox || 'default';
      const img = el.querySelector('img');
      const idx = galleries[group].findIndex(g => g.src === img?.src);
      openLightbox(group, idx >= 0 ? idx : 0);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === lbImg) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });
})();

/* ============================================================
   VIDEO MODAL
   ============================================================ */
(function initVideoModal() {
  const triggers = document.querySelectorAll('[data-video-src]');
  if (!triggers.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'video-modal-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Cerrar"><i class="fas fa-times"></i></button>
    <div class="video-modal-content">
      <video controls playsinline></video>
      <div class="video-modal-label"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const modalVideo = overlay.querySelector('video');
  const modalLabel = overlay.querySelector('.video-modal-label');
  const closeBtn   = overlay.querySelector('.lightbox-close');

  function openVideo(src, label) {
    modalVideo.src = src;
    modalLabel.textContent = label || '';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalVideo.play();
  }

  function closeVideo() {
    overlay.classList.remove('active');
    modalVideo.pause();
    modalVideo.src = '';
    document.body.style.overflow = '';
  }

  triggers.forEach(el => {
    el.addEventListener('click', () => {
      openVideo(el.dataset.videoSrc, el.dataset.videoLabel || '');
    });
  });

  closeBtn.addEventListener('click', closeVideo);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeVideo();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeVideo();
  });
})();

/* ============================================================
   CONTACT FORM — VALIDATION + PHONE NUMBERS ONLY
   ============================================================ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  // Phone field: numbers only
  const phoneField = document.getElementById('telefono');
  if (phoneField) {
    phoneField.addEventListener('input', () => {
      phoneField.value = phoneField.value.replace(/[^0-9+\s]/g, '');
    });
    phoneField.addEventListener('keydown', (e) => {
      const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
      if (allowed.includes(e.key)) return;
      if (e.key === '+' && phoneField.value.length === 0) return;
      if (e.key === ' ') return;
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    });
  }

  contactForm.addEventListener('submit', (e) => {
    const name    = document.getElementById('name')?.value.trim();
    const email   = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    if (!name || !email || !message) {
      e.preventDefault();
      showFormError('Por favor completa todos los campos requeridos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      e.preventDefault();
      showFormError('Por favor ingresa un correo electrónico válido.');
    }
  });
}

function showFormError(msg) {
  let errorEl = document.getElementById('formError');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.id = 'formError';
    errorEl.style.cssText = 'margin-top:12px;padding:14px 18px;background:rgba(220,80,80,0.12);border:1px solid rgba(220,80,80,0.4);color:#e88;font-size:.85rem;';
    contactForm.appendChild(errorEl);
  }
  errorEl.textContent = msg;
  setTimeout(() => { if (errorEl) errorEl.remove(); }, 5000);
}

/* ============================================================
   PARALLAX — Hero background subtle movement
   ============================================================ */
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg, .parallax-bg');
  if (!heroBg || window.matchMedia('(max-width: 768px)').matches) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroBg.style.transform = `translateY(${y * 0.3}px) scale(1.05)`;
    }
  }, { passive: true });
})();

/* ============================================================
   MAGNETIC BUTTONS (21st.dev inspired)
   ============================================================ */
(function initMagneticButtons() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  document.querySelectorAll('.btn-gold, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ============================================================
   CARD 3D TILT (21st.dev inspired)
   ============================================================ */
(function initCardTilt() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  document.querySelectorAll('.card, .program-card, .expertise-item, .company-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ===== SMOOTH CLOSE MOBILE MENU ON OUTSIDE CLICK ===== */
document.addEventListener('click', (e) => {
  if (navMenu && navToggle && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
    navMenu.classList.remove('open');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
  }
});
