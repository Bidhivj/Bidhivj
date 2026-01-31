// =============================================================================
// PHASE SPACE VISUALIZATION - Chirikov Standard Map
// Based on Eq. 2.14 from Bidhi's M.Sc. Thesis
// =============================================================================

/**
 * Chirikov Standard Map (Eq. 2.14):
 *   q_{n+1} = q_n + p_n (mod 1)
 *   p_{n+1} = p_n - (K/2π) sin(2π q_{n+1}) (mod 1)
 *
 * This visualization shows the classic phase space structure:
 * - KAM tori (closed curves) around stable fixed points
 * - Chaotic sea (scattered points) between islands
 * - Island chains at various resonances
 */
class StandardMapVisualization {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Physics
    this.K = options.K ?? 1.0;

    // Visualization parameters
    this.numOrbits = options.numOrbits ?? 40;        // Number of different initial conditions
    this.iterationsPerOrbit = options.iterationsPerOrbit ?? 800;  // How long to trace each orbit
    this.pointSize = options.pointSize ?? 1.2;
    this.primaryColor = options.primaryColor ?? { r: 0, g: 212, b: 170 };

    // Animation
    this.animationSpeed = options.animationSpeed ?? 20;  // Points drawn per frame
    this.isRunning = false;
    this.animationId = null;

    // State
    this.orbits = [];           // Array of orbit objects
    this.currentOrbitIndex = 0;
    this.currentPointIndex = 0;
    this.isBuilding = true;     // Are we still building the phase space?

    // Event handlers
    this.handleResize = this.handleResize.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.handleResize);
    this.canvas.addEventListener('click', this.handleClick);

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.generateOrbits();

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.drawComplete();
    }
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.displayWidth = rect.width;
    this.displayHeight = rect.height;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    this.ctx.scale(dpr, dpr);

    // Clear and set background
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
  }

  handleResize() {
    this.resizeCanvas();
    if (this.isBuilding) {
      // Redraw what we have so far
      this.redrawCurrentState();
    } else {
      this.drawComplete();
    }
  }

  handleClick(e) {
    // Add a new orbit from click position
    const rect = this.canvas.getBoundingClientRect();
    const q = (e.clientX - rect.left) / rect.width;
    const p = 1 - (e.clientY - rect.top) / rect.height;

    // Generate new orbit from this point
    const orbit = this.computeOrbit(q, p, this.iterationsPerOrbit * 2);
    orbit.color = this.getHighlightColor();
    orbit.size = this.pointSize * 1.5;
    this.orbits.push(orbit);

    // Draw it immediately
    this.drawOrbit(orbit);
  }

  mod1(x) {
    return x - Math.floor(x);
  }

  /**
   * Compute a single orbit starting from (q0, p0)
   */
  computeOrbit(q0, p0, iterations) {
    const points = [];
    let q = q0;
    let p = p0;
    const twoPi = 2 * Math.PI;
    const KOverTwoPi = this.K / twoPi;

    for (let i = 0; i < iterations; i++) {
      points.push({ q, p });

      // Standard map iteration (Eq. 2.14)
      const q_new = this.mod1(q + p);
      const p_new = this.mod1(p - KOverTwoPi * Math.sin(twoPi * q_new));

      q = q_new;
      p = p_new;
    }

    return { points, color: null, size: this.pointSize };
  }

  /**
   * Generate initial conditions spread across phase space
   */
  generateOrbits() {
    this.orbits = [];

    // Create a mix of initial conditions:
    // 1. Grid of points to sample different regions
    // 2. Some points near fixed points to show islands

    const { r, g, b } = this.primaryColor;

    // Grid sampling
    const gridSize = Math.ceil(Math.sqrt(this.numOrbits * 0.7));
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (this.orbits.length >= this.numOrbits) break;

        const q = (i + 0.5) / gridSize + (Math.random() - 0.5) * 0.02;
        const p = (j + 0.5) / gridSize + (Math.random() - 0.5) * 0.02;

        const orbit = this.computeOrbit(q, p, this.iterationsPerOrbit);

        // Color based on initial position for variety
        const hue = (i * gridSize + j) * (360 / (gridSize * gridSize));
        orbit.color = this.hslToRgb(hue, 70, 60);

        this.orbits.push(orbit);
      }
    }

    // Add some orbits near the main island centers
    const specialPoints = [
      { q: 0.5, p: 0.0 },   // Near origin (fixed point)
      { q: 0.5, p: 0.5 },   // Center
      { q: 0.25, p: 0.5 },  // Left island region
      { q: 0.75, p: 0.5 },  // Right island region
    ];

    for (const pt of specialPoints) {
      if (this.orbits.length >= this.numOrbits + 4) break;
      const orbit = this.computeOrbit(
        pt.q + (Math.random() - 0.5) * 0.05,
        pt.p + (Math.random() - 0.5) * 0.05,
        this.iterationsPerOrbit
      );
      orbit.color = { r, g, b };  // Primary color for special orbits
      this.orbits.push(orbit);
    }

    this.currentOrbitIndex = 0;
    this.currentPointIndex = 0;
    this.isBuilding = true;
  }

  hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
  }

  getHighlightColor() {
    // Bright cyan for user-added orbits
    return { r: 100, g: 255, b: 220 };
  }

  /**
   * Draw a single point
   */
  drawPoint(q, p, color, size) {
    const x = q * this.displayWidth;
    const y = (1 - p) * this.displayHeight;  // Flip y so p=0 is bottom

    this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw an entire orbit
   */
  drawOrbit(orbit) {
    for (const pt of orbit.points) {
      this.drawPoint(pt.q, pt.p, orbit.color, orbit.size);
    }
  }

  /**
   * Animation frame - gradually build up the phase space
   */
  animate() {
    if (!this.isRunning) return;

    if (this.isBuilding) {
      // Draw several points per frame
      for (let i = 0; i < this.animationSpeed; i++) {
        if (this.currentOrbitIndex >= this.orbits.length) {
          this.isBuilding = false;
          break;
        }

        const orbit = this.orbits[this.currentOrbitIndex];
        const pt = orbit.points[this.currentPointIndex];

        this.drawPoint(pt.q, pt.p, orbit.color, orbit.size);

        this.currentPointIndex++;
        if (this.currentPointIndex >= orbit.points.length) {
          this.currentPointIndex = 0;
          this.currentOrbitIndex++;
        }
      }
    }

    this.animationId = requestAnimationFrame(this.animate);
  }

  /**
   * Draw the complete phase space immediately
   */
  drawComplete() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

    for (const orbit of this.orbits) {
      this.drawOrbit(orbit);
    }

    this.isBuilding = false;
  }

  /**
   * Redraw current state after resize
   */
  redrawCurrentState() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

    // Draw completed orbits
    for (let i = 0; i < this.currentOrbitIndex; i++) {
      this.drawOrbit(this.orbits[i]);
    }

    // Draw partial current orbit
    if (this.currentOrbitIndex < this.orbits.length) {
      const orbit = this.orbits[this.currentOrbitIndex];
      for (let j = 0; j < this.currentPointIndex; j++) {
        const pt = orbit.points[j];
        this.drawPoint(pt.q, pt.p, orbit.color, orbit.size);
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Update K parameter and regenerate
   */
  setK(K) {
    this.K = K;
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    this.generateOrbits();
    this.currentOrbitIndex = 0;
    this.currentPointIndex = 0;
    this.isBuilding = true;
  }

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

  const viz = new StandardMapVisualization(canvas, {
    K: 1.0,
    numOrbits: isMobile ? 25 : 40,
    iterationsPerOrbit: isMobile ? 500 : 800,
    pointSize: isMobile ? 1.0 : 1.2,
    animationSpeed: isMobile ? 50 : 100  // Faster build-up
  });

  viz.start();

  // Set up K slider
  const slider = document.getElementById('alpha-slider');
  const kValue = document.getElementById('alpha-value');

  if (slider) {
    slider.addEventListener('input', (e) => {
      const K = parseFloat(e.target.value);
      viz.setK(K);
      if (kValue) {
        kValue.textContent = K.toFixed(1);
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
