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
// Exam Rankings Canvas Animation
// -----------------------------------------------------------------------------
function initExamRankings() {
  const rankings = document.querySelectorAll('.exam-ranking');
  if (!rankings.length) return;

  rankings.forEach(ranking => {
    const container = ranking.querySelector('.exam-ranking__dots');
    const result = ranking.querySelector('.exam-ranking__result');
    const rank = parseInt(ranking.dataset.rank);
    const totalStr = ranking.dataset.total.replace(/,/g, '');
    const total = parseInt(totalStr);
    const percentile = ranking.dataset.percentile;

    if (!container) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Size canvas to container
    const size = Math.min(container.offsetWidth, 300);
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    // Calculate grid
    const cols = Math.ceil(Math.sqrt(total));
    const dotSize = Math.max(1, (size / cols) * 0.6);
    const gap = size / cols;

    // Mark survivors (top `rank` candidates)
    const survivors = new Set();
    while (survivors.size < rank) {
      survivors.add(Math.floor(Math.random() * total));
    }

    // Pick one survivor as Bidhi (near center for dramatic zoom)
    const centerIndex = Math.floor(cols / 2) * cols + Math.floor(cols / 2);
    let bidhiIndex = centerIndex;
    // Find closest survivor to center
    let minDist = Infinity;
    survivors.forEach(i => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const dist = Math.abs(col - cols/2) + Math.abs(row - cols/2);
      if (dist < minDist) {
        minDist = dist;
        bidhiIndex = i;
      }
    });

    // Bidhi's position
    const bidhiCol = bidhiIndex % cols;
    const bidhiRow = Math.floor(bidhiIndex / cols);
    const bidhiX = bidhiCol * gap + gap / 2;
    const bidhiY = bidhiRow * gap + gap / 2;

    // Animation state
    let animationStarted = false;
    let phase = 0; // 0=elimination, 1=zoom, 2=done
    let eliminationProgress = 0;
    let zoomProgress = 0;
    let pulsePhase = 0;
    const eliminationOrder = shuffleArray([...Array(total).keys()].filter(i => !survivors.has(i)));

    function draw() {
      ctx.clearRect(0, 0, size, size);

      const eliminatedCount = Math.floor(eliminationProgress * eliminationOrder.length);
      const eliminatedSet = new Set(eliminationOrder.slice(0, eliminatedCount));

      // Always draw dots in background (eliminated ones stay visible for context)
      drawDots(eliminatedSet, 1, zoomProgress === 0);

      // During zoom, draw expanding Bidhi circle on top
      if (zoomProgress > 0) {
        const maxRadius = size * 0.38;
        const currentRadius = dotSize + (maxRadius - dotSize) * easeOutCubic(zoomProgress);

        // Outer glow
        const glowRadius = currentRadius * 1.5;
        const gradient = ctx.createRadialGradient(size/2, size/2, currentRadius * 0.3, size/2, size/2, glowRadius);
        gradient.addColorStop(0, 'rgba(0, 212, 170, 0.4)');
        gradient.addColorStop(0.6, 'rgba(0, 212, 170, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 212, 170, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(size/2, size/2, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Dark fill to make text readable against dot background
        ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
        ctx.beginPath();
        ctx.arc(size/2, size/2, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Main circle ring with subtle pulse
        const pulse = 1 + Math.sin(pulsePhase) * 0.02;
        ctx.strokeStyle = '#00d4aa';
        ctx.lineWidth = 2 + zoomProgress * 2;
        ctx.beginPath();
        ctx.arc(size/2, size/2, currentRadius * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Draw stats inside circle when zoom is mostly done
        if (zoomProgress > 0.5) {
          const textOpacity = (zoomProgress - 0.5) * 2;

          // "Top X%"
          ctx.fillStyle = `rgba(0, 212, 170, ${textOpacity})`;
          ctx.font = `bold ${size * 0.12}px "Space Grotesk", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`Top ${percentile}%`, size/2, size/2 - size * 0.08);

          // Rank
          ctx.fillStyle = `rgba(255, 255, 255, ${textOpacity * 0.9})`;
          ctx.font = `${size * 0.06}px "JetBrains Mono", monospace`;
          ctx.fillText(`Rank ${rank.toLocaleString()} of ${parseInt(totalStr).toLocaleString()}`, size/2, size/2 + size * 0.06);

          // "Bidhi" label
          ctx.fillStyle = `rgba(0, 212, 170, ${textOpacity * 0.7})`;
          ctx.font = `${size * 0.045}px "Space Grotesk", sans-serif`;
          ctx.fillText('— Bidhi —', size/2, size/2 + size * 0.16);
        }
      }
    }

    function drawDots(eliminatedSet, opacity, showBidhiGlow) {
      for (let i = 0; i < total; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * gap + gap / 2;
        const y = row * gap + gap / 2;

        if (eliminatedSet.has(i)) {
          // Eliminated - tiny faded dot
          ctx.fillStyle = `rgba(40, 40, 40, ${0.15 * opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, dotSize * 0.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (i === bidhiIndex && showBidhiGlow && eliminationProgress > 0.8) {
          // Bidhi glowing during late elimination
          const glowIntensity = (eliminationProgress - 0.8) * 5;
          ctx.fillStyle = `rgba(0, 212, 170, ${glowIntensity * opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, dotSize * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(0, 212, 170, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, dotSize * 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (survivors.has(i)) {
          // Survivor
          const color = eliminationProgress > 0.7 ? `rgba(0, 212, 170, ${opacity})` : `rgba(100, 100, 100, ${opacity})`;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Not yet eliminated
          ctx.fillStyle = `rgba(70, 70, 70, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate() {
      if (!animationStarted) return;

      // Phase 0: Fast elimination (~1.5 seconds)
      if (phase === 0) {
        eliminationProgress = Math.min(1, eliminationProgress + 0.025);
        if (eliminationProgress >= 1) {
          phase = 1;
        }
      }
      // Phase 1: Zoom into Bidhi (~1 second)
      else if (phase === 1) {
        zoomProgress = Math.min(1, zoomProgress + 0.03);
        pulsePhase += 0.1;
        if (zoomProgress >= 1) {
          phase = 2;
        }
      }
      // Phase 2: Pulse forever
      else {
        pulsePhase += 0.05;
      }

      draw();
      requestAnimationFrame(animate);
    }

    // Initial draw
    draw();

    // Observe for scroll trigger
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
    // Labels - no dot (we use points), lifted above surface
    .labelsData([])
    .labelLat('lat')
    .labelLng('lng')
    .labelText('name')
    .labelSize(1.0)
    .labelDotRadius(0) // No label dot - we have our own points
    .labelAltitude(0.01) // Lift slightly above surface
    .labelColor(() => 'rgba(255, 255, 255, 0.9)')
    .labelResolution(3)
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

  // Initial camera position - zoomed very tight on eastern India
  globe.pointOfView({ lat: 23, lng: 84, altitude: 0.7 }, 0);

  // Animation sequence - refined timing and labels
  function runAnimation() {
    if (!animationStarted) return;

    const phases = [
      // Phase 0: Show Chaibasa with pulsing ring
      () => {
        globe.pointsData([pointsData[0]]);
        globe.ringsData([{ lat: locations.chaibasa.lat, lng: locations.chaibasa.lng }]);
        globe.labelsData([{ ...locations.chaibasa, name: 'Chaibasa' }]);
        setTimeout(() => { currentPhase++; runAnimation(); }, 2000);
      },

      // Phase 1: Arc to Delhi
      () => {
        globe.ringsData([]); // Stop pulsing
        const arc1 = {
          startLat: locations.chaibasa.lat,
          startLng: locations.chaibasa.lng,
          endLat: locations.delhi.lat,
          endLng: locations.delhi.lng,
          color: ['rgba(0,212,170,0.8)', 'rgba(0,212,170,0.8)'],
          altitude: 0.02,
          stroke: 0.4,
          dashLength: 0.8,
          dashGap: 0.05,
          animateTime: 1500
        };
        arcsData.push(arc1);
        globe.arcsData([...arcsData]);

        // Pan slightly to keep both in view
        globe.pointOfView({ lat: 25, lng: 82, altitude: 0.9 }, 1200);

        setTimeout(() => {
          globe.pointsData([pointsData[0], pointsData[1]]);
          globe.labelsData([{ ...locations.delhi, name: 'B.Sc. Physics\nUniv. of Delhi' }]);
        }, 1300);

        setTimeout(() => { currentPhase++; runAnimation(); }, 2200);
      },

      // Phase 2: Arc to Chennai
      () => {
        const arc2 = {
          startLat: locations.delhi.lat,
          startLng: locations.delhi.lng,
          endLat: locations.chennai.lat,
          endLng: locations.chennai.lng,
          color: ['rgba(0,212,170,0.8)', 'rgba(0,212,170,0.8)'],
          altitude: 0.03,
          stroke: 0.4,
          dashLength: 0.8,
          dashGap: 0.05,
          animateTime: 1500
        };
        arcsData.push(arc2);
        globe.arcsData([...arcsData]);

        // Pan down to follow
        globe.pointOfView({ lat: 20, lng: 80, altitude: 1.0 }, 1200);

        setTimeout(() => {
          globe.pointsData([pointsData[0], pointsData[1], pointsData[2]]);
          globe.labelsData([{ ...locations.chennai, name: 'M.Sc. & JRF\nIIT Madras' }]);
        }, 1300);

        setTimeout(() => { currentPhase++; runAnimation(); }, 2500);
      },

      // Phase 3: Pause to show India journey complete, then ZOOM OUT
      () => {
        // Show all India locations with full info
        globe.labelsData([
          { ...locations.chaibasa, name: 'Chaibasa, Jharkhand' },
          { ...locations.delhi, name: 'B.Sc.\nDelhi' },
          { ...locations.chennai, name: 'M.Sc.\nChennai' }
        ]);

        // Dramatic pause, then zoom out
        setTimeout(() => {
          globe.labelsData([]); // Clear labels for clean zoom
          globe.pointOfView({ lat: 20, lng: 30, altitude: 3.5 }, 2500);
        }, 1200);

        setTimeout(() => { currentPhase++; runAnimation(); }, 4000);
      },

      // Phase 4: Launch the shooting star!
      () => {
        const shootingStar = {
          startLat: locations.chennai.lat,
          startLng: locations.chennai.lng,
          endLat: locations.storrs.lat,
          endLng: locations.storrs.lng,
          color: ['#00d4aa', '#66ffe0', '#ffffff', '#66ffe0', '#00d4aa'],
          altitude: 0.6,
          stroke: 2.0,
          dashLength: 0.2,
          dashGap: 0.02,
          animateTime: 4000
        };
        arcsData.push(shootingStar);
        globe.arcsData([...arcsData]);

        // Slow pan following the arc across the Atlantic
        globe.pointOfView({ lat: 30, lng: -30, altitude: 3.0 }, 3500);

        setTimeout(() => { currentPhase++; runAnimation(); }, 4500);
      },

      // Phase 5: Zoom in on Storrs with pulsing ring
      () => {
        globe.pointsData(pointsData);
        globe.ringsData([{ lat: locations.storrs.lat, lng: locations.storrs.lng }]);

        // Zoom in on Storrs
        globe.pointOfView({ lat: 41.8, lng: -72.2, altitude: 0.6 }, 2500);

        setTimeout(() => {
          globe.labelsData([{ ...locations.storrs, name: 'PhD Physics\nUConn, Storrs CT' }]);
        }, 2000);

        setTimeout(() => { currentPhase++; runAnimation(); }, 4500);
      },

      // Phase 6: Final - pull back to show complete journey
      () => {
        globe.ringsData([]); // Stop pulsing

        // Show full info: degree + university + location
        globe.labelsData([
          { ...locations.chaibasa, name: 'Chaibasa\nJharkhand' },
          { ...locations.delhi, name: 'B.Sc. Physics\nUniv. of Delhi' },
          { ...locations.chennai, name: 'M.Sc. & JRF\nIIT Madras, Chennai' },
          { ...locations.storrs, name: 'PhD Physics\nUConn, Storrs CT' }
        ]);

        // Pull back to show the full journey
        globe.pointOfView({ lat: 30, lng: -20, altitude: 2.5 }, 3000);

        // Start gentle rotation after settling
        setTimeout(() => {
          globe.controls().autoRotate = true;
          globe.controls().autoRotateSpeed = 0.12;
        }, 4000);
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
