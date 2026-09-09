// ============ PRODUCT DATA (per runway look) ============
const LOOKS = [
  {
    label: 'Look 01',
    items: [
      { name: 'Brown Tailored Wool-Linen Jacket', price: 'INR 4,200', color: '#6b4a3a', sizes: ['S', 'M', 'L'], sel: 2 },
      { name: 'Cobalt Linen Shirt', price: 'INR 2,600', color: '#33507a', sizes: ['S', 'M', 'L'], sel: 1 }
    ]
  },
  {
    label: 'Look 02',
    items: [
      { name: 'Beige Double-Breasted Blazer', price: 'INR 4,600', color: '#c9b79c', sizes: ['S', 'M', 'L'], sel: 1 },
      { name: 'Cream Wide-Leg Trousers', price: 'INR 2,400', color: '#e8ded0', sizes: ['S', 'M', 'L'], sel: 2 }
    ]
  },
  {
    label: 'Look 03',
    items: [
      { name: 'Ivory Linen Blazer', price: 'INR 4,400', color: '#ece3d3', sizes: ['S', 'M', 'L'], sel: 0 },
      { name: 'Chestnut Linen Shirt', price: 'INR 2,800', color: '#5b4436', sizes: ['S', 'M', 'L'], sel: 1 }
    ]
  },
  {
    label: 'Look 04',
    items: [
      { name: 'Navy Tailored Suit Jacket', price: 'INR 4,800', color: '#232c3d', sizes: ['S', 'M', 'L'], sel: 2 },
      { name: 'Navy Tapered Trousers', price: 'INR 2,900', color: '#2b3448', sizes: ['S', 'M', 'L'], sel: 1 }
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // ---- cart ----
  const cartBadge = document.getElementById('cartBadge');
  let cartCount = 0;

  // ---- mobile menu ----
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const closeMobile = document.getElementById('closeMobile');
  menuToggle.addEventListener('click', () => mobileNav.classList.add('open'));
  closeMobile.addEventListener('click', () => mobileNav.classList.remove('open'));
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

  // ============ SCROLL-TRIGGERED SECTION REVEALS ============
  const revealEls = document.querySelectorAll(
    '.section-head, .fabric-hero, .found-card, ' +
    '.story-intro .intro-block, .value-card, .materials-grid, .quote-banner blockquote, .lifestyle-banner, ' +
    '.product-card, .life-tile, .why-card, .campaign-banner, .brandstory-grid, .proof-card, .journal-card, ' +
    '.proof-row, .story-body p, ' +
    '.journal-featured, .article-hero-pair, .article-body p, .article-body li, .article-pullquote, .article-author'
  );
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(el => revealObserver.observe(el));
    } else {
      // Fallback for browsers without IntersectionObserver support
      revealEls.forEach(el => el.classList.add('in-view'));
    }
  }

  // ============ QUICK VIEW / QUICK ADD popover (shared by product grid + any look carousel) ============
  const quickAdd = document.getElementById('quickAdd');
  const qaClose = document.getElementById('qaClose');
  const qaTitle = document.getElementById('qaTitle');
  const qaItems = document.getElementById('qaItems');

  function openQuickPanel(title, items) {
    if (!quickAdd || !qaItems) return;
    qaTitle.textContent = title;
    qaItems.innerHTML = '';

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'qa-item';

      const sizesHtml = item.sizes.map((s, i) =>
        `<button${i === item.sel ? ' class="sel"' : ''}>${s}</button>`
      ).join('');

      const thumbStyle = item.img
        ? `background-image:url('${item.img}');background-size:cover;background-position:center;`
        : `background:${item.color || '#cfc7b8'};`;

      row.innerHTML = `
        <div class="qa-thumb" style="${thumbStyle}"></div>
        <div class="qa-info">
          <div class="qa-name">${item.name} | ${item.price}</div>
          <div class="qa-sizes">${sizesHtml}</div>
          <button class="qa-add">${item.cta || 'Quick Add'}</button>
        </div>`;
      qaItems.appendChild(row);
    });

    qaItems.querySelectorAll('.qa-sizes').forEach(group => {
      group.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('button').forEach(b => b.classList.remove('sel'));
          btn.classList.add('sel');
        });
      });
    });
    qaItems.querySelectorAll('.qa-add').forEach(btn => {
      btn.addEventListener('click', () => {
        cartCount++;
        cartBadge.textContent = cartCount;
        cartBadge.classList.remove('bump');
        void cartBadge.offsetWidth; // force reflow so the animation can retrigger
        cartBadge.classList.add('bump');
        const original = btn.textContent;
        btn.textContent = 'Added to Bag';
        setTimeout(() => { btn.textContent = original; }, 1200);
      });
    });

    quickAdd.classList.add('open');
  }
  if (qaClose) qaClose.addEventListener('click', () => quickAdd.classList.remove('open'));

  // ---- Product grid "Quick View" (THE KALAI EDIT) ----
  document.querySelectorAll('.product-card').forEach(card => {
    const btn = card.querySelector('.qv-btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = card.dataset.name;
      const price = card.dataset.price;
      const img = card.querySelector('img')?.getAttribute('src');
      const sizes = ['XS', 'S', 'M', 'L', 'XL'];
      openQuickPanel('Quick View', [{ name, price, img, sizes, sel: 2, cta: 'Add to Bag' }]);
    });
  });

  // ============ INFINITE CAROUSEL (only on pages that still use a look carousel) ============
  const track = document.getElementById('carouselTrack');
  const prevArrow = document.getElementById('prevArrow');
  const nextArrow = document.getElementById('nextArrow');
  const dotsWrap = document.getElementById('dots');

  if (track && prevArrow && nextArrow && dotsWrap) {
  const originals = Array.from(track.children);
  const N = originals.length;

  // Build 3 sets: [clone][original][clone] so we can scroll infinitely both ways
  const cloneSetBefore = originals.map(node => node.cloneNode(true));
  const cloneSetAfter = originals.map(node => node.cloneNode(true));
  track.innerHTML = ''; // detach originals from DOM (JS refs above still valid)
  [...cloneSetBefore, ...originals, ...cloneSetAfter].forEach(node => track.appendChild(node));

  function cardStep() {
    const card = track.querySelector('.look-card');
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap || 18);
    return card.getBoundingClientRect().width + gap;
  }

  function setWidth() {
    return cardStep() * N;
  }

  // Start centered on the middle (original) set, no animation
  function centerOnMiddleSet() {
    track.scrollLeft = setWidth();
  }
  // Wait a tick for layout to settle before measuring
  requestAnimationFrame(() => requestAnimationFrame(centerOnMiddleSet));
  window.addEventListener('resize', () => { centerOnMiddleSet(); });

  function currentActiveIndex() {
    const step = cardStep();
    const idx = Math.round((track.scrollLeft - setWidth()) / step);
    return ((idx % N) + N) % N;
  }

  function updateDots() {
    const active = currentActiveIndex();
    dotsWrap.querySelectorAll('span').forEach(d => d.classList.remove('active'));
    const dot = dotsWrap.querySelector(`span[data-i="${active}"]`);
    if (dot) dot.classList.add('active');
  }

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const w = setWidth();
      // Loop: if we've drifted into the clone-before or clone-after zone, snap back
      // into the equivalent spot in the middle zone with no visible jump (identical clones).
      if (track.scrollLeft < w * 0.5) {
        track.scrollLeft += w;
      } else if (track.scrollLeft > w * 1.5) {
        track.scrollLeft -= w;
      }
      updateDots();
    }, 90);
  });

  prevArrow.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
  nextArrow.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: 'smooth' }));

  dotsWrap.querySelectorAll('span').forEach(dot => {
    dot.addEventListener('click', () => {
      const i = parseInt(dot.dataset.i, 10);
      const step = cardStep();
      // Scroll to that look index within the current middle-ish set
      const base = Math.round(track.scrollLeft / step) - currentActiveIndex();
      track.scrollTo({ left: (base + i) * step, behavior: 'smooth' });
    });
  });

  // Delegated click so it works on cloned cards too
  track.addEventListener('click', (e) => {
    const hotspot = e.target.closest('.look-hotspot');
    if (!hotspot) return;
    e.stopPropagation();
    const card = hotspot.closest('.look-card');
    const lookIndex = parseInt(card.dataset.look, 10) || 0;
    const look = LOOKS[lookIndex] || LOOKS[0];
    openQuickPanel(`Shop ${look.label}`, look.items);
  });
  } // end infinite carousel (only present on pages that still use it)

  // ============ FABRIC POETRY — SMOOTH ACCORDION EXPANSION (index.html only) ============
  const continueReading = document.getElementById('continueReading');
  const fabricMore = document.getElementById('fabricMore');
  if (continueReading && fabricMore) {
    const contLabel = continueReading.querySelector('.cont-label');
    continueReading.addEventListener('click', (e) => {
      e.preventDefault();
      const expanded = fabricMore.classList.toggle('expanded');
      continueReading.classList.toggle('expanded', expanded);
      if (contLabel) contLabel.textContent = expanded ? 'Show less' : 'Continue reading';
    });
  }

  // ============ JOURNAL — cluster filter tabs (hub page only) ============
  const filterBar = document.querySelector('.journal-filters');
  if (filterBar) {
    const cards = document.querySelectorAll('.journal-editorial-grid .journal-card');
    filterBar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cluster = btn.dataset.cluster;
        cards.forEach(card => {
          const match = cluster === 'all' || card.dataset.cluster === cluster;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  // ============ NEWSLETTER (any/all forms on the page — footer + dedicated Letter section) ============
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.innerHTML = '&#10003;';
      setTimeout(() => {
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      }, 1500);
    });
  });

  // ============ HERO BUTTONS (index.html only) ============
  const watchBtn = document.getElementById('watchBtn');
  const shopCatwalkBtn = document.getElementById('shopCatwalkBtn');
  if (watchBtn) {
    watchBtn.addEventListener('click', () => {
      alert("The Spring/Summer '26 runway film would play here.");
    });
  }
  if (shopCatwalkBtn) {
    shopCatwalkBtn.addEventListener('click', () => {
      document.getElementById('runway').scrollIntoView({ behavior: 'smooth' });
    });
  }
});
