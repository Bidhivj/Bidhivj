// =============================================================================
// MAIN JAVASCRIPT
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  initMobileNav();

  // Smooth scroll for anchor links
  initSmoothScroll();

  // Scroll reveal animations
  initScrollReveal();

  // Active nav link highlighting
  initActiveNavHighlight();

  // Exam rankings dot animation
  initExamRankings();

  // Scroll progress bar
  initScrollProgress();

  // Section title animations
  initSectionTitles();

  // Timeline animation
  initTimeline();

  // Publication expand/collapse
  initPublications();

  // Staggered grid reveals
  initStaggeredReveals();

  // Floating tags
  initFloatingTags();

  // Journey globe visualization
  initJourneyGlobe();
});

// -----------------------------------------------------------------------------
// Mobile Navigation
// -----------------------------------------------------------------------------
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  if (!toggle || !mobileMenu) return;

  toggle.addEventListener('click', function() {
    const isActive = toggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    mobileMenu.setAttribute('aria-hidden', !isActive);
    toggle.setAttribute('aria-expanded', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
  });

  // Close menu when clicking a link
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      toggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      mobileMenu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// -----------------------------------------------------------------------------
// Smooth Scroll
// -----------------------------------------------------------------------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Scroll Reveal
// -----------------------------------------------------------------------------
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(reveal => observer.observe(reveal));
}

// -----------------------------------------------------------------------------
// Active Nav Highlight
// -----------------------------------------------------------------------------
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-70px 0px -50% 0px'
  });

  sections.forEach(section => observer.observe(section));
}

// -----------------------------------------------------------------------------
// Research Card Toggle
// -----------------------------------------------------------------------------
function toggleTechnical(button) {
  const card = button.closest('.research-card');
  const technical = card.querySelector('.research-card__technical');

  if (technical.classList.contains('show')) {
    technical.classList.remove('show');
    button.textContent = 'Show technical details →';
  } else {
    technical.classList.add('show');
    button.textContent = '← Hide technical details';
  }
}

// -----------------------------------------------------------------------------
// Past Research Toggle
// -----------------------------------------------------------------------------
function togglePastResearch(button) {
  const content = button.nextElementSibling;

  if (content.classList.contains('show')) {
    content.classList.remove('show');
    button.classList.remove('active');
    button.querySelector('span').textContent = 'View Past Research';
  } else {
    content.classList.add('show');
    button.classList.add('active');
    button.querySelector('span').textContent = 'Hide Past Research';
  }
}

// -----------------------------------------------------------------------------
// Exam Rankings Canvas Animation - Physics-based particles
// -----------------------------------------------------------------------------
function initExamRankings() {
  const rankings = document.querySelectorAll('.exam-ranking');
  if (!rankings.length) return;

  rankings.forEach(ranking => {
    const container = ranking.querySelector('.exam-ranking__dots');
    const rank = parseInt(ranking.dataset.rank);
    const totalStr = ranking.dataset.total.replace(/,/g, '');
    const total = parseInt(totalStr);
    const percentile = ranking.dataset.percentile;

    if (!container) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Size canvas
    const size = Math.min(container.offsetWidth, 300);
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    // Grid setup
    const cols = Math.ceil(Math.sqrt(total));
    const baseSize = Math.max(1, (size / cols) * 0.6);
    const gap = size / cols;
    const centerX = size / 2;
    const centerY = size / 2;

    // Create particles with physics properties
    const particles = [];
    const survivors = new Set();
    while (survivors.size < rank) {
      survivors.add(Math.floor(Math.random() * total));
    }

    // Find Bidhi (survivor closest to center)
    let bidhiIndex = 0;
    let minDist = Infinity;
    survivors.forEach(i => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const dist = Math.hypot(col - cols/2, row - cols/2);
      if (dist < minDist) {
        minDist = dist;
        bidhiIndex = i;
      }
    });

    // Initialize all particles
    for (let i = 0; i < total; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const baseX = col * gap + gap / 2;
      const baseY = row * gap + gap / 2;

      particles.push({
        baseX, baseY,
        x: baseX, y: baseY,
        vx: 0, vy: 0,
        offsetX: 0, offsetY: 0,
        isSurvivor: survivors.has(i),
        isBidhi: i === bidhiIndex,
        eliminated: false,
        eliminatedAt: 0,
        scale: 1,
        alpha: 1,
        // Physics properties for survivors
        angle: Math.random() * Math.PI * 2,
        angularVel: (Math.random() - 0.5) * 0.02,
        orbitRadius: Math.random() * 2 + 1,
        breathePhase: Math.random() * Math.PI * 2,
        breatheSpeed: 0.03 + Math.random() * 0.02
      });
    }

    // Animation state
    let animationStarted = false;
    let time = 0;
    let phase = 0; // 0=elimination, 1=gather, 2=zoom, 3=alive
    let eliminationProgress = 0;
    let gatherProgress = 0;
    let zoomProgress = 0;
    const eliminationOrder = shuffleArray([...Array(total).keys()].filter(i => !survivors.has(i)));

    function updatePhysics() {
      time += 0.016; // ~60fps timestep

      for (const p of particles) {
        if (p.isSurvivor && !p.eliminated) {
          // Survivors have gentle floating motion
          if (phase >= 1) {
            // Orbital drift
            p.angle += p.angularVel;
            p.offsetX = Math.cos(p.angle) * p.orbitRadius;
            p.offsetY = Math.sin(p.angle) * p.orbitRadius;

            // Breathing scale
            p.breathePhase += p.breatheSpeed;
            p.scale = 1 + Math.sin(p.breathePhase) * 0.15;
          }

          // Smooth position update
          p.x = p.baseX + p.offsetX;
          p.y = p.baseY + p.offsetY;
        } else if (p.eliminated) {
          // Eliminated particles shrink and fade
          const timeSinceElim = time - p.eliminatedAt;
          p.scale = Math.max(0.15, 1 - timeSinceElim * 2);
          p.alpha = Math.max(0.1, 1 - timeSinceElim * 1.5);
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, size, size);

      // Draw eliminated particles (background)
      for (const p of particles) {
        if (p.eliminated) {
          ctx.fillStyle = `rgba(40, 40, 40, ${p.alpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseSize * p.scale * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw non-eliminated, non-survivor particles
      for (const p of particles) {
        if (!p.eliminated && !p.isSurvivor) {
          ctx.fillStyle = 'rgba(70, 70, 70, 0.8)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw survivors (not Bidhi)
      for (const p of particles) {
        if (p.isSurvivor && !p.isBidhi) {
          const glow = phase >= 1 ? 0.3 : 0;
          if (glow > 0) {
            ctx.fillStyle = `rgba(0, 212, 170, ${glow * 0.5})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, baseSize * p.scale * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = phase >= 1 ? 'rgba(0, 212, 170, 0.9)' : 'rgba(100, 100, 100, 0.8)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, baseSize * p.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Bidhi (special)
      const bidhi = particles[bidhiIndex];
      if (phase < 2) {
        // Before zoom - glowing dot
        const glowIntensity = phase >= 1 ? 1 : Math.max(0, (eliminationProgress - 0.7) / 0.3);
        if (glowIntensity > 0) {
          ctx.fillStyle = `rgba(0, 212, 170, ${glowIntensity * 0.4})`;
          ctx.beginPath();
          ctx.arc(bidhi.x, bidhi.y, baseSize * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = phase >= 1 ? '#00d4aa' : 'rgba(0, 212, 170, 0.9)';
        ctx.beginPath();
        ctx.arc(bidhi.x, bidhi.y, baseSize * bidhi.scale * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Zoom overlay with stats
      if (zoomProgress > 0) {
        const maxRadius = size * 0.38;
        const currentRadius = baseSize + (maxRadius - baseSize) * easeOutCubic(zoomProgress);

        // Outer glow
        const gradient = ctx.createRadialGradient(centerX, centerY, currentRadius * 0.3, centerX, centerY, currentRadius * 1.5);
        gradient.addColorStop(0, 'rgba(0, 212, 170, 0.4)');
        gradient.addColorStop(0.6, 'rgba(0, 212, 170, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 212, 170, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Dark background
        ctx.fillStyle = 'rgba(10, 10, 10, 0.88)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing ring
        const pulse = 1 + Math.sin(time * 3) * 0.015;
        ctx.strokeStyle = '#00d4aa';
        ctx.lineWidth = 2 + zoomProgress * 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Stats text
        if (zoomProgress > 0.4) {
          const textOpacity = (zoomProgress - 0.4) / 0.6;

          ctx.fillStyle = `rgba(0, 212, 170, ${textOpacity})`;
          ctx.font = `bold ${size * 0.13}px "Space Grotesk", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`Top ${percentile}%`, centerX, centerY - size * 0.07);

          ctx.fillStyle = `rgba(255, 255, 255, ${textOpacity * 0.9})`;
          ctx.font = `${size * 0.055}px "JetBrains Mono", monospace`;
          ctx.fillText(`Rank ${rank.toLocaleString()} of ${parseInt(totalStr).toLocaleString()}`, centerX, centerY + size * 0.06);

          ctx.fillStyle = `rgba(0, 212, 170, ${textOpacity * 0.6})`;
          ctx.font = `${size * 0.04}px "Space Grotesk", sans-serif`;
          ctx.fillText('Bidhi', centerX, centerY + size * 0.15);
        }
      }
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate() {
      if (!animationStarted) return;

      // Phase 0: Elimination
      if (phase === 0) {
        eliminationProgress = Math.min(1, eliminationProgress + 0.02);
        const elimCount = Math.floor(eliminationProgress * eliminationOrder.length);

        for (let i = 0; i < elimCount; i++) {
          const idx = eliminationOrder[i];
          if (!particles[idx].eliminated) {
            particles[idx].eliminated = true;
            particles[idx].eliminatedAt = time;
          }
        }

        if (eliminationProgress >= 1) {
          phase = 1;
        }
      }
      // Phase 1: Survivors gather/glow
      else if (phase === 1) {
        gatherProgress = Math.min(1, gatherProgress + 0.025);
        if (gatherProgress >= 1) {
          phase = 2;
        }
      }
      // Phase 2: Zoom to Bidhi
      else if (phase === 2) {
        zoomProgress = Math.min(1, zoomProgress + 0.025);
        if (zoomProgress >= 1) {
          phase = 3;
        }
      }
      // Phase 3: Alive - continuous gentle motion

      updatePhysics();
      draw();
      requestAnimationFrame(animate);
    }

    // Initial draw
    draw();

    // Scroll trigger
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animationStarted) {
          animationStarted = true;
          setTimeout(() => requestAnimationFrame(animate), 300);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(ranking);
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// -----------------------------------------------------------------------------
// Scroll Progress Bar
// -----------------------------------------------------------------------------
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

// -----------------------------------------------------------------------------
// Section Title Animations
// -----------------------------------------------------------------------------
function initSectionTitles() {
  const titles = document.querySelectorAll('.section-title');
  if (!titles.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  titles.forEach(title => observer.observe(title));
}

// -----------------------------------------------------------------------------
// Journey Timeline
// -----------------------------------------------------------------------------
function initTimeline() {
  const journey = document.querySelector('.journey');
  if (!journey) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(journey);
}

// -----------------------------------------------------------------------------
// Publication Expand/Collapse
// -----------------------------------------------------------------------------
function initPublications() {
  const publications = document.querySelectorAll('.publication');

  publications.forEach(pub => {
    // Add expand hint if there's a summary
    const summary = pub.querySelector('.publication__summary');
    if (summary) {
      const hint = document.createElement('div');
      hint.className = 'publication__expand-hint';
      hint.innerHTML = 'Click to read more <i class="fas fa-chevron-down"></i>';

      // Insert before summary
      summary.parentNode.insertBefore(hint, summary);

      pub.addEventListener('click', (e) => {
        // Don't toggle if clicking a link
        if (e.target.tagName === 'A') return;
        pub.classList.toggle('expanded');
      });
    }
  });
}

// -----------------------------------------------------------------------------
// Staggered Grid Reveals
// -----------------------------------------------------------------------------
function initStaggeredReveals() {
  const grids = document.querySelectorAll('.awards-grid, .teaching-grid');

  grids.forEach(grid => {
    grid.classList.add('stagger-reveal');
    Array.from(grid.children).forEach(child => {
      child.classList.add('reveal-item');
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');

        // Add revealed class to each child with staggered delay (for shimmer effect)
        Array.from(entry.target.children).forEach((child, i) => {
          setTimeout(() => {
            child.classList.add('revealed');
          }, i * 100 + 300);
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  grids.forEach(grid => observer.observe(grid));
}

// -----------------------------------------------------------------------------
// Floating Tags (subtle animation)
// -----------------------------------------------------------------------------
function initFloatingTags() {
  const heroTags = document.querySelectorAll('.hero__interests .tag');
  heroTags.forEach(tag => tag.classList.add('tag--float'));
}

// -----------------------------------------------------------------------------
// Journey Globe Visualization
// -----------------------------------------------------------------------------
function initJourneyGlobe() {
  const container = document.getElementById('globe-container');
  if (!container || typeof Globe === 'undefined') return;

  // Location coordinates (Storrs, CT is the specific destination)
  const locations = {
    chaibasa: { lat: 22.55, lng: 85.80, name: 'Chaibasa', year: '2017' },
    delhi: { lat: 28.61, lng: 77.21, name: 'Delhi', year: '2017-2020' },
    chennai: { lat: 13.08, lng: 80.27, name: 'Chennai', year: '2021-2024' },
    storrs: { lat: 41.8084, lng: -72.2495, name: 'Storrs, CT', year: '2024-Present' }
  };

  // Arc data - will be populated during animation
  const arcsData = [];

  // Points data - origin and destination prominent, waypoints subtle
  const pointsData = [
    { ...locations.chaibasa, size: 0.3, color: '#00d4aa' },
    { ...locations.delhi, size: 0.15, color: '#888' },
    { ...locations.chennai, size: 0.15, color: '#888' },
    { ...locations.storrs, size: 0.35, color: '#00d4aa' }
  ];

  // Ring data for pulsing effect on key locations
  const ringsData = [];

  // Initialize globe
  const globe = Globe()
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('#00d4aa')
    .atmosphereAltitude(0.12)
    // Points (locations)
    .pointsData([])
    .pointLat('lat')
    .pointLng('lng')
    .pointAltitude(0.005)
    .pointRadius('size')
    .pointColor('color')
    // Rings (pulse effect)
    .ringsData([])
    .ringLat('lat')
    .ringLng('lng')
    .ringColor(() => t => `rgba(0, 212, 170, ${1 - t})`)
    .ringMaxRadius(3)
    .ringPropagationSpeed(2)
    .ringRepeatPeriod(1500)
    // Arcs (journey paths)
    .arcsData([])
    .arcStartLat(d => d.startLat)
    .arcStartLng(d => d.startLng)
    .arcEndLat(d => d.endLat)
    .arcEndLng(d => d.endLng)
    .arcColor(d => d.color)
    .arcAltitude(d => d.altitude || 0.15)
    .arcStroke(d => d.stroke || 0.5)
    .arcDashLength(d => d.dashLength || 0.5)
    .arcDashGap(d => d.dashGap || 0.1)
    .arcDashAnimateTime(d => d.animateTime || 2000)
    // HTML Labels - rendered on top of WebGL, never occluded by arcs
    .htmlElementsData([])
    .htmlLat('lat')
    .htmlLng('lng')
    .htmlAltitude(0.02)
    .htmlElement(d => {
      const el = document.createElement('div');
      el.className = 'globe-label';
      el.innerHTML = d.name.replace(/\n/g, '<br>');
      return el;
    })
    (container);

  // Resize handler
  function handleResize() {
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    globe.width(width).height(height);
  }
  handleResize();
  window.addEventListener('resize', handleResize);

  // Animation state
  let animationStarted = false;
  let currentPhase = 0;

  // Initial camera - very tight on Chaibasa
  globe.pointOfView({ lat: 22.5, lng: 85.8, altitude: 0.4 }, 0);

  // Cinematic animation sequence with dynamic zooming
  function runAnimation() {
    if (!animationStarted) return;

    const phases = [
      // 1. TIGHT ON CHAIBASA - intimate start
      () => {
        globe.pointsData([pointsData[0]]);
        globe.ringsData([{ lat: locations.chaibasa.lat, lng: locations.chaibasa.lng }]);
        globe.htmlElementsData([{ ...locations.chaibasa, name: 'Chaibasa\nHometown' }]);
        setTimeout(() => { currentPhase++; runAnimation(); }, 2000);
      },

      // 2. PULL BACK - reveal India context, prep for arc
      () => {
        globe.ringsData([]);
        globe.htmlElementsData([]);
        globe.pointOfView({ lat: 24, lng: 82, altitude: 0.8 }, 1200);
        setTimeout(() => { currentPhase++; runAnimation(); }, 1500);
      },

      // 3. ARC TO DELHI - camera follows north
      () => {
        const arc1 = {
          startLat: locations.chaibasa.lat,
          startLng: locations.chaibasa.lng,
          endLat: locations.delhi.lat,
          endLng: locations.delhi.lng,
          color: ['rgba(0,212,170,0.9)', 'rgba(0,212,170,0.9)'],
          altitude: 0.02,
          stroke: 0.6,
          dashLength: 0.9,
          dashGap: 0.02,
          animateTime: 1500
        };
        arcsData.push(arc1);
        globe.arcsData([...arcsData]);
        globe.pointOfView({ lat: 26, lng: 80, altitude: 0.7 }, 1500);
        setTimeout(() => { currentPhase++; runAnimation(); }, 1800);
      },

      // 4. ZOOM IN ON DELHI - acknowledge the milestone
      () => {
        globe.pointsData([pointsData[0], pointsData[1]]);
        globe.pointOfView({ lat: 28.6, lng: 77.2, altitude: 0.35 }, 1000);
        setTimeout(() => {
          globe.htmlElementsData([{ ...locations.delhi, name: 'B.Sc. Physics\nUniv. of Delhi' }]);
        }, 800);
        setTimeout(() => { currentPhase++; runAnimation(); }, 2000);
      },

      // 5. PULL BACK - prep for Chennai arc
      () => {
        globe.htmlElementsData([]);
        globe.pointOfView({ lat: 22, lng: 80, altitude: 0.9 }, 1000);
        setTimeout(() => { currentPhase++; runAnimation(); }, 1200);
      },

      // 6. ARC TO CHENNAI - camera follows south
      () => {
        const arc2 = {
          startLat: locations.delhi.lat,
          startLng: locations.delhi.lng,
          endLat: locations.chennai.lat,
          endLng: locations.chennai.lng,
          color: ['rgba(0,212,170,0.9)', 'rgba(0,212,170,0.9)'],
          altitude: 0.03,
          stroke: 0.6,
          dashLength: 0.9,
          dashGap: 0.02,
          animateTime: 1500
        };
        arcsData.push(arc2);
        globe.arcsData([...arcsData]);
        globe.pointOfView({ lat: 16, lng: 80, altitude: 0.7 }, 1500);
        setTimeout(() => { currentPhase++; runAnimation(); }, 1800);
      },

      // 7. ZOOM IN ON CHENNAI - acknowledge M.Sc. & JRF
      () => {
        globe.pointsData([pointsData[0], pointsData[1], pointsData[2]]);
        globe.pointOfView({ lat: 13, lng: 80.3, altitude: 0.35 }, 1000);
        setTimeout(() => {
          globe.htmlElementsData([{ ...locations.chennai, name: 'M.Sc. & JRF\nIIT Madras' }]);
        }, 800);
        setTimeout(() => { currentPhase++; runAnimation(); }, 2000);
      },

      // 8. BIG ZOOM OUT - the dramatic reveal
      () => {
        globe.htmlElementsData([]);
        globe.pointOfView({ lat: 20, lng: 40, altitude: 3.2 }, 2000);
        setTimeout(() => { currentPhase++; runAnimation(); }, 2500);
      },

      // 9. THE SHOOTING STAR - climax!
      () => {
        const shootingStar = {
          startLat: locations.chennai.lat,
          startLng: locations.chennai.lng,
          endLat: locations.storrs.lat,
          endLng: locations.storrs.lng,
          color: ['#00d4aa', '#66ffe0', '#ffffff', '#66ffe0', '#00d4aa'],
          altitude: 0.55,
          stroke: 2.5,
          dashLength: 0.12,
          dashGap: 0.008,
          animateTime: 3500
        };
        arcsData.push(shootingStar);
        globe.arcsData([...arcsData]);
        // Pan following the arc across the Atlantic
        globe.pointOfView({ lat: 32, lng: -35, altitude: 2.5 }, 3500);
        setTimeout(() => { currentPhase++; runAnimation(); }, 4000);
      },

      // 10. ZOOM IN ON STORRS - arrival!
      () => {
        globe.pointsData(pointsData);
        globe.ringsData([{ lat: locations.storrs.lat, lng: locations.storrs.lng }]);
        globe.pointOfView({ lat: 41.8, lng: -72.2, altitude: 0.4 }, 1500);
        setTimeout(() => {
          globe.htmlElementsData([{ ...locations.storrs, name: 'PhD Physics\nUConn, Storrs CT' }]);
        }, 1200);
        setTimeout(() => { currentPhase++; runAnimation(); }, 2500);
      },

      // 11. FINAL - pull back, show complete journey
      () => {
        globe.ringsData([]);
        globe.htmlElementsData([
          { ...locations.chaibasa, name: 'Hometown' },
          { ...locations.delhi, name: 'B.Sc.' },
          { ...locations.chennai, name: 'M.Sc. & JRF' },
          { ...locations.storrs, name: 'PhD' }
        ]);
        globe.pointOfView({ lat: 30, lng: -15, altitude: 2.2 }, 2000);
        setTimeout(() => {
          globe.controls().autoRotate = true;
          globe.controls().autoRotateSpeed = 0.1;
        }, 2500);
      }
    ];

    if (currentPhase < phases.length) {
      phases[currentPhase]();
    }
  }

  // Observe for scroll trigger
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animationStarted) {
        animationStarted = true;
        setTimeout(runAnimation, 500);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(container);
}

// -----------------------------------------------------------------------------
// Add active state styling for nav links
// -----------------------------------------------------------------------------
const style = document.createElement('style');
style.textContent = `
  .nav__link.active {
    color: #00d4aa;
  }
`;
document.head.appendChild(style);
