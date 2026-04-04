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

/* ===== HERO SLIDER ===== */
(function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  if (!slides.length) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
})();

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

/* ============================================================
   DIPLOMA CAROUSEL
   ============================================================ */
(function initCarousel() {
  const track  = document.querySelector('.carousel-track');
  if (!track) return;

  const slides  = Array.from(track.querySelectorAll('.carousel-slide'));
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const dotsEl  = document.querySelector('.carousel-dots');

  let current = 0;

  function getVisible() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    return 3;
  }

  // Build dots based on initial visible count
  function buildDots() {
    dotsEl.innerHTML = '';
    const pages = Math.ceil(slides.length / getVisible());
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Página ' + (i + 1));
      d.addEventListener('click', () => goTo(i * getVisible()));
      dotsEl.appendChild(d);
    }
  }

  function goTo(index) {
    const vis = getVisible();
    const max = slides.length - vis;
    current = Math.max(0, Math.min(index, max));
    const slideWidth = slides[0].offsetWidth + 20;
    track.style.transform = 'translateX(-' + (current * slideWidth) + 'px)';
    updateDots();
  }

  function updateDots() {
    const page = Math.floor(current / getVisible());
    document.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === page);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - getVisible()));
  nextBtn.addEventListener('click', () => goTo(current + getVisible()));

  window.addEventListener('resize', () => {
    buildDots();
    goTo(0);
  });

  // Touch / swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + getVisible()) : goTo(current - getVisible());
    }
  });

  buildDots();
})();

/* ============================================================
   MÉTODO SHOCK — CANVAS SHADER SIMULADO
   Añadir al final de js/main.js
   ============================================================ */

(function initMetodoShader() {

  // Función genérica para inicializar un canvas shader
  function createShader(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W, H, animId;
    let t = 0;

    // Paleta: dorado + negro del proyecto
    const GOLD_R = 201, GOLD_G = 168, GOLD_B = 76;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width  = rect.width;
      H = canvas.height = rect.height;
    }

    // --- Partículas flotantes ---
    const PARTICLE_COUNT = 55;
    const particles = [];

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x:     Math.random() * W,
          y:     Math.random() * H,
          r:     Math.random() * 1.8 + 0.3,
          vx:    (Math.random() - 0.5) * 0.35,
          vy:    (Math.random() - 0.5) * 0.35,
          alpha: Math.random() * 0.6 + 0.1,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // --- Líneas de conexión entre partículas cercanas ---
    const CONNECTION_DIST = 130;

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.2;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${GOLD_R}, ${GOLD_G}, ${GOLD_B}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    // --- Ondas de gradiente tipo "shader noise" ---
    function drawWaves() {
      const numWaves = 4;
      for (let w = 0; w < numWaves; w++) {
        const wt = t * 0.0006 + w * (Math.PI / numWaves);
        const yBase = H * (0.2 + w * 0.18);
        const amp   = 35 + w * 12;
        const freq  = 0.004 + w * 0.002;

        ctx.beginPath();
        ctx.moveTo(0, yBase);

        for (let x = 0; x <= W; x += 4) {
          const noise1 = Math.sin(x * freq + wt) * amp;
          const noise2 = Math.sin(x * freq * 1.7 - wt * 0.8) * (amp * 0.4);
          const y = yBase + noise1 + noise2;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();

        const alpha = 0.025 - w * 0.004;
        ctx.fillStyle = `rgba(${GOLD_R}, ${GOLD_G}, ${GOLD_B}, ${alpha})`;
        ctx.fill();
      }
    }

    // --- Glow orbs background ---
    function drawOrbs() {
      const orbs = [
        { x: W * 0.15, y: H * 0.3,  r: 180, a: 0.06 },
        { x: W * 0.82, y: H * 0.65, r: 220, a: 0.05 },
        { x: W * 0.5,  y: H * 0.85, r: 150, a: 0.04 },
      ];

      orbs.forEach((orb, i) => {
        const pulse = Math.sin(t * 0.001 + i * 1.5) * 0.015;
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0,   `rgba(${GOLD_R}, ${GOLD_G}, ${GOLD_B}, ${orb.a + pulse})`);
        grad.addColorStop(0.5, `rgba(${GOLD_R}, ${GOLD_G}, ${GOLD_B}, ${orb.a * 0.4})`);
        grad.addColorStop(1,   `rgba(${GOLD_R}, ${GOLD_G}, ${GOLD_B}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // --- Loop principal ---
    function draw(timestamp) {
      t = timestamp;
      ctx.clearRect(0, 0, W, H);

      // Fondo oscuro base
      ctx.fillStyle = 'rgba(10, 10, 10, 0.0)';
      ctx.fillRect(0, 0, W, H);

      drawOrbs();
      drawWaves();

      // Actualizar y dibujar partículas
      particles.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W+10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H+10) p.y = -10;

        const flicker = Math.sin(timestamp * 0.002 + p.phase) * 0.2 + 0.8;
        const alpha   = p.alpha * flicker;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD_R}, ${GOLD_G}, ${GOLD_B}, ${alpha})`;
        ctx.fill();
      });

      drawConnections();

      animId = requestAnimationFrame(draw);
    }

    // Pausa cuando el canvas no está visible (performance)
    const visObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animId) animId = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(animId);
          animId = null;
        }
      });
    }, { threshold: 0.05 });

    // Init
    resize();
    initParticles();
    visObserver.observe(canvas);

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    }, { passive: true });
  }

  // Inicializar ambos canvas (index + programas)
  createShader('metodoCanvas');
  createShader('metodoProgramasCanvas');

})();

/* ===== DIPLOMA SLIDER MOBILE ===== */
(function initDiplomaSlider() {
  const sliderEl = document.querySelector('.diploma-slider-mobile');
  if (!sliderEl) return;

  const track = sliderEl.querySelector('.diploma-track');
  const cards = Array.from(track.querySelectorAll('.diploma-card'));
  const dotsEl = sliderEl.querySelector('.diploma-slider-dots');
  if (!cards.length) return;

  let current = 0;

  // Build dots
  cards.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Diploma ' + (i + 1));
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(btn);
  });

  function goTo(index) {
    cards[current].classList.remove('active');
    dotsEl.children[current].classList.remove('active');
    current = Math.max(0, Math.min(index, cards.length - 1));
    cards[current].classList.add('active');
    dotsEl.children[current].classList.add('active');
    // Offset: each card is 80% + 10% left padding + 16px gap
    const cardW = cards[0].offsetWidth;
    const gap = 16;
    // Center active card accounting for 10% peek padding
    const trackPad = sliderEl.offsetWidth * 0.1;
    track.style.transform = 'translateX(' + (trackPad - current * (cardW + gap)) + 'px)';
  }

  // Init first card active
  cards[0].classList.add('active');

  // Touch/swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goTo(current + 1) : goTo(current - 1);
  });

  window.addEventListener('resize', () => goTo(current));
})();
