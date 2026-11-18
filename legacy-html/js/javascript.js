/* ==========================================================================
   Spectrum Financial — Main JavaScript
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('sbf-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header + back-to-top ---------- */
  var header = document.getElementById('sbfHeader');
  var toTop = document.getElementById('sbfToTop');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Scroll progress bar ---------- */
  var progress = document.getElementById('sbfProgress');
  if (progress) {
    var updateProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? (window.scrollY || window.pageYOffset) / max : 0;
      progress.style.transform = 'scaleX(' + Math.min(Math.max(ratio, 0), 1) + ')';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* ---------- Mouse spotlight on cards ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.sbf-spotlight').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--sbf-mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--sbf-my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Process line fill ---------- */
  var progressRows = document.querySelectorAll('[data-sbf-progress]');
  if ('IntersectionObserver' in window) {
    var rowObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-active');
        rowObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    progressRows.forEach(function (row) { rowObserver.observe(row); });
  } else {
    progressRows.forEach(function (row) { row.classList.add('is-active'); });
  }

  /* ---------- Parallax backgrounds ---------- */
  var parallaxEls = document.querySelectorAll('[data-sbf-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    var updateParallax = function () {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var section = el.parentElement;
        var rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return; // off-screen
        var speed = parseFloat(el.getAttribute('data-sbf-parallax')) || 0.3;
        // distance of section centre from viewport centre
        var offset = (rect.top + rect.height / 2) - vh / 2;
        el.style.transform = 'translate3d(0,' + (offset * -speed).toFixed(1) + 'px,0)';
      });
      ticking = false;
    };
    var requestParallax = function () {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    };
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    updateParallax();
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('[data-sbf-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-sbf-delay'), 10) || 0;
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-revealed');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
  }

  /* ---------- Counters ---------- */
  var counters = document.querySelectorAll('[data-sbf-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-sbf-count'), 10) || 0;
    if (reduceMotion || target === 0) { el.textContent = target; return; }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Eligibility check (hero) ---------- */
  var amount = document.getElementById('sbfAmount');
  var amountValue = document.getElementById('sbfAmountValue');
  var revenue = document.getElementById('sbfRevenue');
  var result = document.getElementById('sbfResult');
  var form = document.getElementById('sbfEligibility');
  var estMonthly = document.getElementById('sbfEstMonthly');
  var estTerm = document.getElementById('sbfEstTerm');

  var currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  function updateAmount() {
    if (!amount) return;
    var min = +amount.min, max = +amount.max, val = +amount.value;
    amountValue.textContent = currency.format(val);
    amount.style.setProperty('--sbf-fill', ((val - min) / (max - min) * 100) + '%');

    if (estMonthly) {
      // Estimated monthly based on competitive working capital rates
      var approxMonthly = Math.round((val * 1.14) / 12);
      estMonthly.textContent = currency.format(approxMonthly) + '/mo';
    }
    if (estTerm) {
      estTerm.textContent = val > 200000 ? 'Up to 36 mos' : '3 – 24 mos';
    }
  }

  function updateResult() {
    if (!revenue || !result) return;
    var level = parseInt(revenue.value, 10);
    var text = result.querySelector('span');
    if (level >= 2) {
      result.classList.add('is-approved');
      text.innerHTML = '<strong>Great news — you\'re pre-approved.</strong> Businesses with over $20,000 in monthly sales qualify.';
    } else {
      result.classList.remove('is-approved');
      text.innerHTML = 'You may still qualify. <strong>Bad credit? No problem</strong> — apply and a specialist will review your options.';
    }
  }

  if (amount) {
    amount.addEventListener('input', updateAmount);
    updateAmount();
  }
  if (revenue) {
    revenue.addEventListener('change', updateResult);
    updateResult();
  }
  if (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  }

  /* ---------- Quote form (front-end validation only) ----------
     NOTE: no backend is connected yet. Hook the submit handler up to your
     form endpoint / CRM before going live. */
  var quoteForm = document.getElementById('sbfQuoteForm');
  var quoteSuccess = document.getElementById('sbfQuoteSuccess');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!quoteForm.checkValidity()) {
        quoteForm.classList.add('was-validated');
        var firstInvalid = quoteForm.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      quoteForm.classList.remove('was-validated');
      if (quoteSuccess) {
        quoteSuccess.hidden = false;
        quoteSuccess.setAttribute('tabindex', '-1');
        quoteSuccess.focus();
      }
      quoteForm.reset();
    });
  }

  /* ---------- Close offcanvas menu when a link is clicked ---------- */
  var menu = document.getElementById('sbfMenu');
  if (menu && window.bootstrap) {
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        var instance = bootstrap.Offcanvas.getInstance(menu);
        if (instance) instance.hide();
      });
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('sbfYear');
  if (year) year.textContent = new Date().getFullYear();
})();

/* ---------- Legal pages: table-of-contents highlight + reading progress ---------- */
(function () {
  'use strict';
  var toc = document.querySelector('.sbf-legal-toc');
  var doc = document.querySelector('.sbf-legal-doc');
  if (!toc || !doc) return;

  // Collapsible menu below 1200px (starts closed); always open on desktop
  var details = toc.querySelector('.sbf-legal-toc-details');
  var mq = window.matchMedia('(max-width: 1199.98px)');
  if (details) {
    var syncDetails = function () { details.open = !mq.matches; };
    syncDetails();
    if (mq.addEventListener) mq.addEventListener('change', syncDetails);
    details.querySelector('summary').addEventListener('click', function (e) {
      if (!mq.matches) e.preventDefault();
    });
    details.addEventListener('click', function (e) {
      if (mq.matches && e.target.closest('a')) details.open = false;
    });
  }

  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var bar = toc.querySelector('.sbf-legal-toc-progress span');
  var ticking = false;

  function update() {
    var offset = 140;
    var current = 0;
    targets.forEach(function (el, i) {
      if (el && el.getBoundingClientRect().top - offset <= 0) current = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });

    // keep the active item visible inside the (scrollbar-free) list
    var list = toc.querySelector('ol');
    var act = links[current];
    if (list && act && list.scrollHeight > list.clientHeight) {
      var top = act.offsetTop - list.offsetTop;
      if (top < list.scrollTop || top + act.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = top - list.clientHeight / 2 + act.offsetHeight / 2;
      }
    }

    if (bar) {
      var r = doc.getBoundingClientRect();
      var total = r.height - window.innerHeight + offset;
      var done = Math.min(Math.max(-r.top + offset, 0), Math.max(total, 1));
      bar.style.width = (done / Math.max(total, 1) * 100).toFixed(1) + '%';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
