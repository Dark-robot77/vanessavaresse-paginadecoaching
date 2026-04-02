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
