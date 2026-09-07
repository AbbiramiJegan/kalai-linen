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

  // ============ INFINITE CAROUSEL ============
  const track = document.getElementById('carouselTrack');
  const prevArrow = document.getElementById('prevArrow');
  const nextArrow = document.getElementById('nextArrow');
  const dotsWrap = document.getElementById('dots');

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

  // ============ QUICK ADD (per-look, populated dynamically) ============
  const quickAdd = document.getElementById('quickAdd');
  const qaClose = document.getElementById('qaClose');
  const qaTitle = document.getElementById('qaTitle');
  const qaItems = document.getElementById('qaItems');

  function renderQuickAdd(lookIndex) {
    const look = LOOKS[lookIndex] || LOOKS[0];
    qaTitle.textContent = `Shop ${look.label}`;
    qaItems.innerHTML = '';

    look.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'qa-item';

      const sizesHtml = item.sizes.map((s, i) =>
        `<button${i === item.sel ? ' class="sel"' : ''}>${s}</button>`
      ).join('');

      row.innerHTML = `
        <div class="qa-thumb" style="background:${item.color}"></div>
        <div class="qa-info">
          <div class="qa-name">${item.name} | ${item.price}</div>
          <div class="qa-sizes">${sizesHtml}</div>
          <button class="qa-add">Quick Add</button>
        </div>`;
      qaItems.appendChild(row);
    });

    // Wire up size selection + add-to-cart for this render
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
        const original = btn.textContent;
        btn.textContent = 'Added';
        setTimeout(() => { btn.textContent = original; }, 1200);
      });
    });
  }

  // Delegated click so it works on cloned cards too
  track.addEventListener('click', (e) => {
    const hotspot = e.target.closest('.look-hotspot');
    if (!hotspot) return;
    e.stopPropagation();
    const card = hotspot.closest('.look-card');
    const lookIndex = parseInt(card.dataset.look, 10) || 0;
    renderQuickAdd(lookIndex);
    quickAdd.classList.add('open');
  });

  qaClose.addEventListener('click', () => quickAdd.classList.remove('open'));

  // ============ FABRIC POETRY CONTINUE READING ============
  const continueReading = document.getElementById('continueReading');
  continueReading.addEventListener('click', (e) => {
    e.preventDefault();
    const p = e.currentTarget.previousElementSibling;
    if (p.dataset.expanded === 'true') return;
    p.textContent += " Every garment is pre-washed by hand and left to rest before it ever reaches a hanger, so the drape you feel in the store is the drape you'll wear for years.";
    p.dataset.expanded = 'true';
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.style.pointerEvents = 'none';
  });

  // ============ NEWSLETTER ============
  document.getElementById('newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = '&#10003;';
    setTimeout(() => {
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    }, 1500);
  });

  // ============ HERO BUTTONS ============
  document.getElementById('watchBtn').addEventListener('click', () => {
    alert("The Spring/Summer '26 runway film would play here.");
  });
  document.getElementById('shopCatwalkBtn').addEventListener('click', () => {
    document.getElementById('runway').scrollIntoView({ behavior: 'smooth' });
  });
});