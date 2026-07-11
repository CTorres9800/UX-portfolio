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
          '<a href="/" class="logo">Christopher Torres</a>' +
          '<button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">' +
            '<span class="menu-bar"></span>' +
            '<span class="menu-bar"></span>' +
            '<span class="menu-bar"></span>' +
          '</button>' +
          '<nav class="nav">' +
            '<a href="/#about">ABOUT</a>' +
            '<a href="/#work">WORK</a>' +
            '<a href="/Christopher-Torres-Resume.pdf" target="_blank" rel="noopener">RESUME</a>' +
            '<a href="/#contact">CONTACT</a>' +
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
