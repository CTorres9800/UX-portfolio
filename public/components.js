// Shared UI components — header, footer, nav behavior
(function () {
  const linkedInSVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';
  const emailSVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>';

  // Header
  var headerEl = document.getElementById('site-header');
  if (headerEl) {
    headerEl.outerHTML =
      '<header class="header">' +
        '<div class="container header-inner">' +
          '<a href="/" class="logo"><span class="logo-first">Christopher</span> Torres</a>' +
          '<button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">' +
            '<svg class="menu-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
              '<rect class="menu-line menu-line-1" width="15.3821" height="2.05601" style="transform:matrix(-0.707107,0.707107,0.707107,0.707107,29.0898,18.2128)" fill="black"/>' +
              '<rect class="menu-line menu-line-2" width="22" height="2.05601" style="transform:matrix(-0.707107,0.707107,0.707107,0.707107,27.0508,11.4949)" fill="black"/>' +
              '<rect class="menu-line menu-line-3" width="15.3821" height="2.05601" style="transform:matrix(-0.707107,0.707107,0.707107,0.707107,20.332,9.45662)" fill="black"/>' +
            '</svg>' +
          '</button>' +
          '<nav class="nav">' +
            '<a href="/about">ABOUT</a>' +
            '<a href="/#work">WORK</a>' +
            '<a href="/Christopher-Torres-Resume.pdf" target="_blank" rel="noopener">RESUME</a>' +
            '<a href="/contact">CONTACT</a>' +
            '<a href="https://www.linkedin.com/in/christorres17/" target="_blank" rel="noopener" class="nav-icon" aria-label="LinkedIn">' +
              linkedInSVG +
            '</a>' +
          '</nav>' +
        '</div>' +
      '</header>';
  }

  // Footer
  var footerEl = document.getElementById('site-footer');
  if (footerEl) {
    footerEl.outerHTML =
      '<footer class="footer">' +
        '<div class="container footer-inner">' +
          '<p>&copy; 2026 Christopher Torres Design. All rights reserved.</p>' +
          '<div class="footer-right">' +
            '<a href="#" class="back-to-top" onclick="window.scrollTo({top:0,behavior:\'smooth\'});return false;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>Back to top</a>' +
            '<div class="footer-icons">' +
              '<a href="https://www.linkedin.com/in/christorres17/" target="_blank" rel="noopener" class="footer-icon" aria-label="LinkedIn">' +
                linkedInSVG +
              '</a>' +
              '<a href="mailto:christophertorres17@gmail.com" class="footer-icon" aria-label="Email">' +
                emailSVG +
              '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  // Journey experience map on small screens: keep the real matrix — phases,
  // the emotion curve that rises and falls, the points, everything — so it still
  // reads as a journey session. It's just laid out at a fixed design width and
  // scaled down to fit the viewport (pinch-zoom reads the detail). The desktop
  // markup is untouched; a display:contents wrapper is layout-neutral above 900px.
  var JOURNEY_DESIGN_WIDTH = 1000;

  function fitJourneyMaps() {
    var isSmall = window.matchMedia('(max-width: 900px)').matches;
    document.querySelectorAll('.cs-journey-map, .mi-sitemap').forEach(function (map) {
      var scaler = map.parentNode;
      if (!scaler.classList || !scaler.classList.contains('cs-journey-scaler')) {
        scaler = document.createElement('div');
        scaler.className = 'cs-journey-scaler';
        map.parentNode.insertBefore(scaler, map);
        scaler.appendChild(map);
      }

      if (!isSmall) {
        map.style.width = '';
        map.style.transform = '';
        map.style.transformOrigin = '';
        scaler.style.height = '';
        return;
      }

      var dw = parseInt(map.getAttribute('data-design-w'), 10) || JOURNEY_DESIGN_WIDTH;
      map.style.width = dw + 'px';
      map.style.transformOrigin = 'top left';
      map.style.transform = 'none';
      var scale = scaler.clientWidth / dw;
      map.style.transform = 'scale(' + scale + ')';
      scaler.style.height = (map.offsetHeight * scale) + 'px';
    });
  }

  fitJourneyMaps();
  window.addEventListener('resize', fitJourneyMaps);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitJourneyMaps);
  }

  // Lightbox for case-study portfolio images. Scoped to `.cs-section img`, which
  // only exists on case-study pages and excludes the hero/header image (that
  // lives in .cs-hero). Linked images are skipped.
  (function () {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('.cs-section img'))
      .filter(function (img) { return !img.closest('a') && !img.closest('.cs-hero-image'); });
    if (!imgs.length) return;

    var chevL = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    var chevR = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    var xIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
    var zoomInIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    var zoomOutIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

    var multi = imgs.length > 1;
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML =
      '<button class="lb-close" aria-label="Close">' + xIcon + '</button>' +
      '<button class="lb-zoom" aria-label="Zoom to full width">' + zoomInIcon + '</button>' +
      (multi ? '<button class="lb-nav lb-prev" aria-label="Previous image">' + chevL + '</button>' : '') +
      '<div class="lb-frame"><img class="lb-img" alt=""></div>' +
      (multi ? '<button class="lb-nav lb-next" aria-label="Next image">' + chevR + '</button>' : '') +
      (multi ? '<div class="lb-counter"><span class="lb-i"></span> / <span class="lb-t"></span></div>' : '');
    document.body.appendChild(lb);

    var lbImg = lb.querySelector('.lb-img');
    var frame = lb.querySelector('.lb-frame');
    var zoomBtn = lb.querySelector('.lb-zoom');
    var iEl = lb.querySelector('.lb-i'), tEl = lb.querySelector('.lb-t');
    var cur = 0, zoomed = false;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function setZoom(on) {
      zoomed = on;
      lb.classList.toggle('is-zoomed', on);
      zoomBtn.innerHTML = on ? zoomOutIcon : zoomInIcon;
      zoomBtn.setAttribute('aria-label', on ? 'Fit image' : 'Zoom to full width');
      frame.scrollTop = 0;
    }
    if (tEl) tEl.textContent = pad(imgs.length);

    function show(n) {
      cur = (n + imgs.length) % imgs.length;
      setZoom(false);
      var src = imgs[cur].currentSrc || imgs[cur].src;
      lbImg.style.opacity = '0';
      var pre = new Image();
      pre.onload = function () {
        lbImg.src = src; lbImg.alt = imgs[cur].alt || ''; lbImg.style.opacity = '1';
        // MedImpact screens are exported at 2x, so true size = half the native width.
        // Show them at true size on open (no zoom needed); the frame scrolls if larger than the viewport.
        var mi = src.indexOf('/images/medimpact/') !== -1;
        lb.classList.toggle('lb--truesize', mi);
        if (mi) {
          var nw = pre.naturalWidth, nh = pre.naturalHeight, ar = nw ? nh / nw : 1;
          var phone = nw <= 900 && ar > 1.5;
          var tw = phone ? (nw > 600 ? nw / 2 : nw) : nw / 2;
          lbImg.style.width = Math.round(tw) + 'px';
          lbImg.style.height = 'auto';
          lbImg.style.maxWidth = 'none';
          lbImg.style.maxHeight = 'none';
          // Full-page screens get no frame padding; components (modals) keep it.
          var el = imgs[cur];
          var fullPage = (el.closest && !!el.closest('.mi-shot')) || el.classList.contains('mi-hifi-img') || el.classList.contains('cs-annotated-img') || el.classList.contains('mi-appshot') || el.classList.contains('mi-fp-board') || (el.closest && !!el.closest('.mi-fp-grid'));
          lb.classList.toggle('lb--nopad', fullPage);
          // Pop-up modals carry a border (so their edge is visible on the white frame);
          // dropdowns/widgets (marked plain) and full-page screens do not.
          var popupModal = (el.classList.contains('mi-comp-img') && !el.classList.contains('mi-comp-img--plain')) || (el.closest && !!el.closest('.mi-dropdown--popup'));
          lb.classList.toggle('lb--bordered', popupModal);
        } else {
          lbImg.style.width = ''; lbImg.style.height = '';
          lbImg.style.maxWidth = ''; lbImg.style.maxHeight = '';
          lb.classList.remove('lb--nopad');
          lb.classList.remove('lb--bordered');
        }
      };
      pre.src = src;
      if (iEl) iEl.textContent = pad(cur + 1);
    }
    function onKey(e) {
      if (e.key === 'Escape') closeLb();
      else if (multi && e.key === 'ArrowRight') show(cur + 1);
      else if (multi && e.key === 'ArrowLeft') show(cur - 1);
    }
    function openLb(n) {
      show(n);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lb-lock');
      document.addEventListener('keydown', onKey);
    }
    function closeLb() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lb-lock');
      document.removeEventListener('keydown', onKey);
    }

    imgs.forEach(function (img, i) {
      img.classList.add('zoomable');
      img.addEventListener('click', function () { openLb(i); });
    });
    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    zoomBtn.addEventListener('click', function (e) { e.stopPropagation(); setZoom(!zoomed); });
    frame.addEventListener('click', function (e) { e.stopPropagation(); if (lb.classList.contains('lb--truesize')) return; setZoom(!zoomed); });
    if (multi) {
      lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
      lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
    }
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  })();

  // Mobile menu toggle
  var header = document.querySelector('.header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');
  var body = document.body;

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('nav-open');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', open);
    body.classList.toggle('nav-locked', open);
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('nav-open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('nav-locked');
    });
  });

  // Hide on scroll down, show on scroll up
  var lastScrollY = window.scrollY;

  window.addEventListener('scroll', function () {
    var currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 72) {
      header.classList.add('header--hidden');
    } else {
      header.classList.remove('header--hidden');
    }

    lastScrollY = currentScrollY;
  });
})();

/* Normalize competitor logos to identical rendered cap-height:
   tighten each SVG's viewBox to its ink bounds so a fixed CSS height renders uniformly. */
(function () {
  function tighten() {
    var svgs = document.querySelectorAll('.cs-problem-card .cs-logo');
    for (var i = 0; i < svgs.length; i++) {
      var svg = svgs[i];
      if (svg.dataset.tightened) continue;
      try {
        var b = svg.getBBox();
        if (b && b.width > 0.5 && b.height > 0.5) {
          var pad = b.height * 0.02;
          svg.setAttribute('viewBox', (b.x - pad).toFixed(2) + ' ' + (b.y - pad).toFixed(2) + ' ' +
            (b.width + pad * 2).toFixed(2) + ' ' + (b.height + pad * 2).toFixed(2));
          svg.dataset.tightened = '1';
        }
      } catch (e) { /* getBBox needs layout; retry on load */ }
    }
  }
  if (document.readyState !== 'loading') tighten();
  else document.addEventListener('DOMContentLoaded', tighten);
  window.addEventListener('load', tighten);
})();

/* Mobile-screen masonry: place each phone screenshot under the shortest column,
   at a consistent column width, so nothing waits for a full new row. */
(function () {
  function layout() {
    var grids = document.querySelectorAll('.mi-shots--mobile');
    for (var g = 0; g < grids.length; g++) {
      var grid = grids[g];
      var items = grid.querySelectorAll('.mi-shot');
      if (!items.length) continue;
      var cols = window.innerWidth <= 900 ? 2 : 4;
      var gap = 20;
      var width = grid.clientWidth;
      var colW = (width - gap * (cols - 1)) / cols;
      grid.classList.add('mi-masonry-on');
      var colH = [];
      for (var c = 0; c < cols; c++) colH.push(0);
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        it.style.width = colW + 'px';
        var shortest = 0;
        for (var k = 1; k < cols; k++) { if (colH[k] < colH[shortest]) shortest = k; }
        it.style.left = (shortest * (colW + gap)) + 'px';
        it.style.top = colH[shortest] + 'px';
        colH[shortest] += it.offsetHeight + gap;
      }
      var max = 0;
      for (var m = 0; m < cols; m++) { if (colH[m] > max) max = colH[m]; }
      grid.style.height = (max - gap) + 'px';
    }
  }
  var t;
  function schedule() { clearTimeout(t); t = setTimeout(layout, 60); }
  if (document.readyState !== 'loading') layout();
  else document.addEventListener('DOMContentLoaded', layout);
  window.addEventListener('load', layout);
  window.addEventListener('resize', schedule);
  // Re-run as each phone image finishes loading (heights change).
  document.querySelectorAll('.mi-shots--mobile .mi-shot img').forEach(function (img) {
    if (!img.complete) img.addEventListener('load', schedule);
  });
})();
