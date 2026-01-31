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
// Timeline Animation
// -----------------------------------------------------------------------------
function initTimeline() {
  const timeline = document.querySelector('.timeline-horizontal');
  if (!timeline) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(timeline);
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
// Add active state styling for nav links
// -----------------------------------------------------------------------------
const style = document.createElement('style');
style.textContent = `
  .nav__link.active {
    color: #00d4aa;
  }
`;
document.head.appendChild(style);
