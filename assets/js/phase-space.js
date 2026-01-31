// =============================================================================
// PHASE SPACE VISUALIZATION - Standard Map (Kicked Rotor)
// Based on Eq. 1 from "Quantum-classical correspondence in quantum channels"
// Phys. Rev. E 111, 014210 (2025) - arXiv:2407.14067
// =============================================================================

/**
 * Implements the Chirikov standard map (kicked rotor):
 *   p' = p - (α/2π) sin(2πq)   [momentum kick]
 *   q' = q + p'                [free rotation]
 * Both taken mod 1 (toral phase space).
 *
 * The parameter α controls chaos:
 *   α ≈ 0:   Nearly integrable, dominated by KAM tori
 *   α ≈ 1:   Last spanning torus breaks
 *   α ≈ 2:   Beautiful island structure (default)
 *   α > 5:   Increasingly chaotic
 */
class StandardMapVisualization {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Physics parameters
    this.alpha = options.alpha ?? 2.0;
    this.numParticles = options.numParticles ?? 3000;

    // Visual parameters
    this.trailLength = options.trailLength ?? 8;
    this.particleRadius = options.particleRadius ?? 1.5;
    this.fadeAlpha = options.fadeAlpha ?? 0.05;
    this.primaryColor = options.primaryColor ?? { r: 0, g: 212, b: 170 };

    // Performance
    this.targetFPS = options.targetFPS ?? 30;
    this.iterationsPerFrame = options.iterationsPerFrame ?? 1;
    this.framesPerIteration = options.framesPerIteration ?? 3;  // Slow down: iterate every N frames

    // State
    this.particles = [];
    this.tracers = [];  // Special bright tracer particles from clicks
    this.animationId = null;
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / this.targetFPS;
    this.frameCount = 0;
    this.isRunning = false;
    this.prefersReducedMotion = false;

    // Periodic refresh to keep it dynamic
    this.refreshInterval = options.refreshInterval ?? 45000;  // Refresh every 45 seconds
    this.lastRefreshTime = 0;

    // Initialize
    this.checkReducedMotion();
    this.handleResize = this.handleResize.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.handleResize);
    this.canvas.addEventListener('click', this.handleClick);
    this.init();
  }

  /**
   * Check for reduced motion preference
   */
  checkReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = mediaQuery.matches;

    mediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion) {
        this.stop();
        this.drawStaticFrame();
      } else if (!this.isRunning) {
        this.start();
      }
    });
  }

  /**
   * Initialize canvas and particles
   */
  init() {
    this.resizeCanvas();
    this.initParticles();

    if (this.prefersReducedMotion) {
      this.drawStaticFrame();
    }
  }

  /**
   * Resize canvas to match container
   */
  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.scale(dpr, dpr);
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }

  /**
   * Handle window resize
   */
  handleResize() {
    this.resizeCanvas();
    this.ctx.fillStyle = 'rgba(10, 10, 10, 1)';
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
  }

  /**
   * Handle click to add tracer particle
   */
  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert screen coords to phase space coords
    const q = x / this.displayWidth;
    const p = 1 - (y / this.displayHeight);

    // Add tracer particle with long trail
    this.tracers.push({
      q: q,
      p: p,
      trail: [],
      maxTrail: 80,  // Much longer trail for tracers
      age: 0,
      maxAge: 500    // Fade out after this many iterations
    });

    // Limit number of tracers
    if (this.tracers.length > 5) {
      this.tracers.shift();
    }
  }

  /**
   * Initialize particles on a grid across phase space
   */
  initParticles() {
    this.particles = [];
    const gridSize = Math.ceil(Math.sqrt(this.numParticles));

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (this.particles.length >= this.numParticles) break;

        const offset = 0.001;
        this.particles.push({
          q: (i + 0.5) / gridSize + (Math.random() - 0.5) * offset,
          p: (j + 0.5) / gridSize + (Math.random() - 0.5) * offset,
          trail: []
        });
      }
    }
  }

  /**
   * Mod 1 operation for toral phase space
   */
  mod1(x) {
    return x - Math.floor(x);
  }

  /**
   * Standard map iteration for main particles - the core physics from Eq. 1
   */
  iterateParticles() {
    const twoPi = 2 * Math.PI;
    const alphaOverTwoPi = this.alpha / twoPi;

    for (const particle of this.particles) {
      particle.trail.push({ q: particle.q, p: particle.p });
      if (particle.trail.length > this.trailLength) {
        particle.trail.shift();
      }

      const p_new = this.mod1(particle.p - alphaOverTwoPi * Math.sin(twoPi * particle.q));
      const q_new = this.mod1(particle.q + p_new);

      particle.q = q_new;
      particle.p = p_new;
    }
  }

  /**
   * Iterate tracer particles (called every frame for responsiveness)
   */
  iterateTracers() {
    const twoPi = 2 * Math.PI;
    const alphaOverTwoPi = this.alpha / twoPi;

    for (const tracer of this.tracers) {
      tracer.trail.push({ q: tracer.q, p: tracer.p });
      if (tracer.trail.length > tracer.maxTrail) {
        tracer.trail.shift();
      }

      const p_new = this.mod1(tracer.p - alphaOverTwoPi * Math.sin(twoPi * tracer.q));
      const q_new = this.mod1(tracer.q + p_new);

      tracer.q = q_new;
      tracer.p = p_new;
      tracer.age++;
    }

    // Remove old tracers
    this.tracers = this.tracers.filter(t => t.age < t.maxAge);
  }

  /**
   * Draw current state
   */
  draw() {
    const w = this.displayWidth;
    const h = this.displayHeight;
    const { r, g, b } = this.primaryColor;

    // Fade previous frame
    this.ctx.fillStyle = `rgba(10, 10, 10, ${this.fadeAlpha})`;
    this.ctx.fillRect(0, 0, w, h);

    // Draw main particles
    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
    for (const particle of this.particles) {
      const x = particle.q * w;
      const y = (1 - particle.p) * h;
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.particleRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw tracer particles with glowing trails
    for (const tracer of this.tracers) {
      const fadeMultiplier = 1 - (tracer.age / tracer.maxAge);

      // Draw trail
      for (let i = 0; i < tracer.trail.length; i++) {
        const point = tracer.trail[i];
        const trailAlpha = (i / tracer.trail.length) * 0.8 * fadeMultiplier;
        const x = point.q * w;
        const y = (1 - point.p) * h;

        this.ctx.fillStyle = `rgba(255, 255, 255, ${trailAlpha})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Draw current position (bright)
      const x = tracer.q * w;
      const y = (1 - tracer.p) * h;

      // Glow effect
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 8);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * fadeMultiplier})`);
      gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${0.6 * fadeMultiplier})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 8, 0, Math.PI * 2);
      this.ctx.fill();

      // Core dot
      this.ctx.fillStyle = `rgba(255, 255, 255, ${fadeMultiplier})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Draw a static frame showing the phase space structure
   */
  drawStaticFrame() {
    const w = this.displayWidth;
    const h = this.displayHeight;
    const { r, g, b } = this.primaryColor;

    this.ctx.fillStyle = 'rgba(10, 10, 10, 1)';
    this.ctx.fillRect(0, 0, w, h);

    const tempParticles = [];
    const gridSize = 50;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        tempParticles.push({
          q: (i + 0.5) / gridSize,
          p: (j + 0.5) / gridSize
        });
      }
    }

    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;

    const iterations = 100;
    const twoPi = 2 * Math.PI;
    const alphaOverTwoPi = this.alpha / twoPi;

    for (let iter = 0; iter < iterations; iter++) {
      for (const p of tempParticles) {
        const p_new = this.mod1(p.p - alphaOverTwoPi * Math.sin(twoPi * p.q));
        const q_new = this.mod1(p.q + p_new);
        p.q = q_new;
        p.p = p_new;

        const x = p.q * w;
        const y = (1 - p.p) * h;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  /**
   * Animation loop with frame rate control
   */
  animate(currentTime) {
    if (!this.isRunning) return;

    this.animationId = requestAnimationFrame(this.animate);

    const elapsed = currentTime - this.lastFrameTime;
    if (elapsed < this.frameInterval) return;

    this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
    this.frameCount++;

    // Periodic soft refresh - reinitialize a portion of particles to keep it dynamic
    if (currentTime - this.lastRefreshTime > this.refreshInterval) {
      this.softRefresh();
      this.lastRefreshTime = currentTime;
    }

    // Tracers iterate every frame for responsiveness
    this.iterateTracers();

    // Main particles iterate every N frames (slows down the evolution)
    if (this.frameCount % this.framesPerIteration === 0) {
      for (let i = 0; i < this.iterationsPerFrame; i++) {
        this.iterateParticles();
      }
    }

    this.draw();
  }

  /**
   * Soft refresh - reinitialize particles gradually to keep visualization dynamic
   */
  softRefresh() {
    const gridSize = Math.ceil(Math.sqrt(this.numParticles));
    const offset = 0.001;

    // Reinitialize all particles to fresh grid positions
    let idx = 0;
    for (let i = 0; i < gridSize && idx < this.particles.length; i++) {
      for (let j = 0; j < gridSize && idx < this.particles.length; j++) {
        this.particles[idx].q = (i + 0.5) / gridSize + (Math.random() - 0.5) * offset;
        this.particles[idx].p = (j + 0.5) / gridSize + (Math.random() - 0.5) * offset;
        this.particles[idx].trail = [];
        idx++;
      }
    }
  }

  /**
   * Start animation
   */
  start() {
    if (this.prefersReducedMotion) {
      this.drawStaticFrame();
      return;
    }

    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.lastRefreshTime = performance.now();
    this.frameCount = 0;
    this.animationId = requestAnimationFrame(this.animate);
  }

  /**
   * Stop animation
   */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.stop();
    this.initParticles();
    this.tracers = [];
    this.ctx.fillStyle = 'rgba(10, 10, 10, 1)';
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    this.start();
  }

  /**
   * Update alpha parameter (kick strength)
   */
  setAlpha(alpha) {
    this.alpha = alpha;
    // Optionally reset particles when alpha changes significantly
  }

  /**
   * Clean up
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.canvas.removeEventListener('click', this.handleClick);
  }
}


// =============================================================================
// INITIALIZATION
// =============================================================================

function initPhaseSpaceVisualization() {
  const canvas = document.getElementById('phase-space-canvas');
  if (!canvas) return null;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

  let numParticles = 3000;
  if (isMobile) numParticles = 1500;
  if (isLowEnd) numParticles = 1000;

  const viz = new StandardMapVisualization(canvas, {
    alpha: 2.0,
    numParticles: numParticles,
    trailLength: 8,
    particleRadius: 1.5,
    fadeAlpha: 0.04,           // Slower fade for longer trails
    targetFPS: 30,
    iterationsPerFrame: 1,
    framesPerIteration: 8,     // Slow evolution: ~4 iterations/second
    refreshInterval: 40000,    // Refresh every 40 seconds
    primaryColor: { r: 0, g: 212, b: 170 }
  });

  viz.start();

  // Set up alpha slider if present
  const slider = document.getElementById('alpha-slider');
  const alphaValue = document.getElementById('alpha-value');

  if (slider) {
    slider.addEventListener('input', (e) => {
      const alpha = parseFloat(e.target.value);
      viz.setAlpha(alpha);
      if (alphaValue) {
        alphaValue.textContent = alpha.toFixed(1);
      }
    });
  }

  window.phaseSpaceViz = viz;
  return viz;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPhaseSpaceVisualization);
} else {
  initPhaseSpaceVisualization();
}
